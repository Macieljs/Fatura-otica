param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Frontend', 'Backend')]
    [string]$Scope,
    [Parameter(Mandatory = $true)]
    [string]$ResultsDirectory,
    [ValidateSet('Bootstrap', 'Feature')]
    [string]$Level = 'Feature',
    [string[]]$StageFailures = @()
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$resultsPath = if ([IO.Path]::IsPathRooted($ResultsDirectory)) {
    [IO.Path]::GetFullPath($ResultsDirectory)
} else {
    [IO.Path]::GetFullPath((Join-Path $repoRoot $ResultsDirectory))
}
if (-not (Test-Path -LiteralPath $resultsPath -PathType Container)) {
    Write-Error "Diretório de resultados ausente: $resultsPath"
    exit 1
}
$blockers = [Collections.Generic.List[string]]::new()
$checks = [Collections.Generic.List[object]]::new()
. (Join-Path $PSScriptRoot 'source-identity.ps1')
$sourceIdentity = Get-WorkflowSourceIdentity $repoRoot
$sourceManifest = Join-Path $resultsPath 'run-source.json'
try {
    if (-not (Test-Path -LiteralPath $sourceManifest -PathType Leaf)) { throw 'Manifesto da execução ausente.' }
    $runSource = [IO.File]::ReadAllText($sourceManifest) | ConvertFrom-Json
    if ($runSource.sourceSnapshotHash -ne $sourceIdentity.sourceSnapshotHash -or $runSource.commit -ne $sourceIdentity.commit) {
        throw 'Os arquivos ou o HEAD mudaram após o início desta execução.'
    }
} catch { $blockers.Add("Identidade da evidência: $($_.Exception.Message)") }
foreach ($stage in $StageFailures) { $blockers.Add("Etapa de execução não aprovada: $stage") }

if ($Scope -eq 'Backend') {
    $projects = if ($Level -eq 'Bootstrap') { @('FaturaOtica.Architecture.Tests') } else {
        @('FaturaOtica.Architecture.Tests', 'FaturaOtica.Domain.Tests', 'FaturaOtica.Application.Tests', 'FaturaOtica.Integration.Tests')
    }
    foreach ($project in $projects) {
        $trxFile = Join-Path (Join-Path $resultsPath $project) "$project.trx"
        if (-not (Test-Path -LiteralPath $trxFile -PathType Leaf)) {
            $blockers.Add("$project`: relatório TRX ausente.")
            continue
        }
        try {
            [xml]$trx = [IO.File]::ReadAllText($trxFile)
            $counters = $trx.SelectSingleNode("//*[local-name()='ResultSummary']/*[local-name()='Counters']")
            if (-not $counters) { throw 'Contadores TRX ausentes.' }
            foreach ($attribute in @('total', 'executed', 'passed', 'failed', 'notExecuted')) {
                if (-not $counters.HasAttribute($attribute)) { throw "Contador TRX ausente: $attribute" }
            }
            $executed = [int]$counters.executed
            $passed = [int]$counters.passed
            $failed = [int]$counters.failed
            $notExecuted = [int]$counters.notExecuted
            $resultNodes = @($trx.SelectNodes("//*[local-name()='UnitTestResult']"))
            $passedNodes = @($resultNodes | Where-Object { $_.outcome -eq 'Passed' }).Count
            if ($resultNodes.Count -lt 1 -or $passedNodes -ne $passed) {
                $blockers.Add("$project`: resultados individuais ausentes ou inconsistentes com os contadores.")
            }
            $checks.Add([ordered]@{ name = $project; executed = $executed; passed = $passed; failed = $failed; skipped = $notExecuted; report = $trxFile })
            if ($executed -lt 1) { $blockers.Add("$project`: zero testes executados.") }
            if ($failed -ne 0 -or $passed -ne $executed -or $notExecuted -ne 0) {
                $blockers.Add("$project`: testes falhos, ignorados ou não aprovados.")
            }
        } catch {
            $blockers.Add("$project`: TRX inválido: $($_.Exception.Message)")
        }
    }
    if ($Level -eq 'Feature') {
        $coverageRoot = Join-Path $resultsPath 'FaturaOtica.Domain.Tests'
        $packages = @()
        $coverageHashes = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
        if (Test-Path -LiteralPath $coverageRoot) {
            foreach ($coverageFile in Get-ChildItem -LiteralPath $coverageRoot -Recurse -Filter 'coverage.cobertura.xml' -File) {
                try {
                    # VSTest can copy an attachment into In/; accept only byte-identical duplicates.
                    $coverageHash = (Get-FileHash -LiteralPath $coverageFile.FullName -Algorithm SHA256).Hash
                    if (-not $coverageHashes.Add($coverageHash)) { continue }
                    [xml]$coverage = [IO.File]::ReadAllText($coverageFile.FullName)
                    $packages += @($coverage.SelectNodes("//*[local-name()='package' and @name='FaturaOtica.Domain']"))
                } catch { $blockers.Add("Cobertura inválida: $($coverageFile.FullName)") }
            }
        }
        if ($coverageHashes.Count -gt 1 -or $packages.Count -ne 1) {
            $blockers.Add('Cobertura do Domínio ausente ou ambígua nesta execução.')
        } else {
            $domainPackage = $packages[0]
            $lines = @($domainPackage.SelectNodes(".//*[local-name()='class']/*[local-name()='lines']/*[local-name()='line']"))
            try {
                $rate = [double]::Parse([string]$domainPackage.'line-rate', [Globalization.CultureInfo]::InvariantCulture)
            } catch { $rate = [double]::NaN }
            $checks.Add([ordered]@{ name = 'Domain line coverage'; percent = [Math]::Round($rate * 100, 2); instrumentedLines = $lines.Count })
            if ($lines.Count -eq 0 -or [double]::IsNaN($rate) -or [double]::IsInfinity($rate) -or $rate -lt 0.9 -or $rate -gt 1) {
                $blockers.Add('Domínio precisa de linhas instrumentadas e cobertura de pelo menos 90%.')
            }
        }
    }
} else {
    if ($Level -eq 'Bootstrap') { $blockers.Add('Bootstrap é permitido somente para a infraestrutura do backend.') }
    $unitRoot = Join-Path $resultsPath 'unit'
    $unitCases = @()
    if (Test-Path -LiteralPath $unitRoot) {
        foreach ($unitFile in Get-ChildItem -LiteralPath $unitRoot -Recurse -Filter '*.xml' -File) {
            try {
                [xml]$junit = [IO.File]::ReadAllText($unitFile.FullName)
                if ($junit.DocumentElement.LocalName -notin @('testsuite', 'testsuites')) { throw 'Raiz JUnit inválida.' }
                $unitCases += @($junit.SelectNodes("//*[local-name()='testcase']"))
                foreach ($suite in $junit.SelectNodes("//*[local-name()='testsuite']")) {
                    if ([int]$suite.failures -gt 0 -or [int]$suite.errors -gt 0) { $blockers.Add("JUnit registra falha de suíte: $($unitFile.FullName)") }
                }
            } catch { $blockers.Add("JUnit inválido: $($unitFile.FullName)") }
        }
    }
    $unitFailed = @($unitCases | Where-Object { $_.SelectSingleNode("./*[local-name()='failure' or local-name()='error']") }).Count
    $unitSkipped = @($unitCases | Where-Object { $_.SelectSingleNode("./*[local-name()='skipped']") }).Count
    $checks.Add([ordered]@{ name = 'Frontend unit'; total = $unitCases.Count; failed = $unitFailed; skipped = $unitSkipped })
    if ($unitCases.Count -lt 1 -or $unitFailed -gt 0 -or $unitSkipped -gt 0) {
        $blockers.Add('Frontend: testes unitários/componentes ausentes, falhos ou ignorados.')
    }
    $e2eFile = Join-Path $resultsPath 'e2e/results.json'
    try {
        if (-not (Test-Path -LiteralPath $e2eFile -PathType Leaf)) { throw 'JSON do Playwright ausente.' }
        $e2e = [IO.File]::ReadAllText($e2eFile) | ConvertFrom-Json
        if (-not $e2e.stats) { throw 'Estatísticas do Playwright ausentes.' }
        foreach ($stat in @('expected', 'unexpected', 'skipped', 'flaky')) {
            if (-not $e2e.stats.PSObject.Properties[$stat] -or [int]$e2e.stats.$stat -lt 0) { throw "Estatística inválida/ausente: $stat" }
        }
        function Get-PlaywrightReportedTests($suite) {
            foreach ($spec in $suite.specs) { foreach ($test in $spec.tests) { $test } }
            foreach ($child in $suite.suites) { Get-PlaywrightReportedTests $child }
        }
        $reportedTests = @($e2e.suites | ForEach-Object { Get-PlaywrightReportedTests $_ })
        $expectedTests = @($reportedTests | Where-Object { $_.status -eq 'expected' -and @($_.results).Count -gt 0 }).Count
        if ($reportedTests.Count -lt 1 -or $expectedTests -ne [int]$e2e.stats.expected) { throw 'Resultados individuais do Playwright ausentes ou inconsistentes.' }
        $checks.Add([ordered]@{ name = 'Frontend E2E'; passed = $e2e.stats.expected; failed = $e2e.stats.unexpected; skipped = $e2e.stats.skipped; flaky = $e2e.stats.flaky })
        if ([int]$e2e.stats.expected -lt 1 -or [int]$e2e.stats.unexpected -gt 0 -or [int]$e2e.stats.skipped -gt 0 -or [int]$e2e.stats.flaky -gt 0 -or @($e2e.errors).Count -gt 0) {
            $blockers.Add('Frontend: E2E ausente, falho, ignorado, instável ou com erro de execução.')
        }
    } catch { $blockers.Add("Frontend E2E: $($_.Exception.Message)") }
}

$summary = [ordered]@{
    schemaVersion = 1
    scope = $Scope
    level = $Level
    sourceIdentity = $sourceIdentity
    generatedAtUtc = [DateTime]::UtcNow.ToString('o')
    conclusion = $(if ($blockers.Count -eq 0) { 'passed' } else { 'blocked' })
    evidence = $checks.ToArray()
    blockers = $blockers.ToArray()
    stageFailures = $StageFailures
    validationType = 'test-reports-and-reported-stage-results'
    deploymentAuthorized = $false
}
$json = $summary | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path $resultsPath 'summary.json'), $json, [Text.UTF8Encoding]::new($false))
Write-Output $json
if ($blockers.Count -gt 0) { exit 1 }
exit 0
