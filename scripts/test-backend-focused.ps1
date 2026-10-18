param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Architecture', 'Domain', 'Application', 'Integration')]
    [string]$Project,
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Filter,
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug',
    [switch]$NoRestore
)

$ErrorActionPreference = 'Stop'
$totalStopwatch = [Diagnostics.Stopwatch]::StartNew()
$repoRoot = Split-Path -Parent $PSScriptRoot
$projectName = "FaturaOtica.$Project.Tests"
$projectFile = Join-Path $repoRoot "backend/tests/$projectName/$projectName.csproj"
if (-not (Test-Path -LiteralPath $projectFile -PathType Leaf)) {
    throw "Projeto de teste não encontrado: $projectFile"
}

$runId = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$resultsRoot = Join-Path $repoRoot "artifacts/quality/backend/focused/$runId"
[IO.Directory]::CreateDirectory($resultsRoot) | Out-Null
. (Join-Path $PSScriptRoot 'source-identity.ps1')
$sourceBefore = Get-WorkflowSourceIdentity $repoRoot
[IO.File]::WriteAllText((Join-Path $resultsRoot 'run-source.json'), ($sourceBefore | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))

$testResults = Join-Path $resultsRoot $projectName
[IO.Directory]::CreateDirectory($testResults) | Out-Null
$trxName = "$projectName.trx"
$testArgs = @(
    'test', $projectFile,
    '--configuration', $Configuration,
    '--filter', $Filter,
    '--logger', 'console;verbosity=normal',
    '--logger', "trx;LogFileName=$trxName",
    '--results-directory', $testResults
)
if ($NoRestore) { $testArgs += '--no-restore' }

$stopwatch = [Diagnostics.Stopwatch]::StartNew()
Push-Location -LiteralPath $repoRoot
try {
    & dotnet @testArgs
    $dotnetExitCode = $LASTEXITCODE
} finally {
    Pop-Location
    $stopwatch.Stop()
}

$blockers = [Collections.Generic.List[string]]::new()
$trxPath = Join-Path $testResults $trxName
$counters = $null
if (-not (Test-Path -LiteralPath $trxPath -PathType Leaf)) {
    $blockers.Add('Relatório TRX não foi gerado.')
} else {
    try {
        [xml]$trx = [IO.File]::ReadAllText($trxPath)
        $counters = $trx.SelectSingleNode("//*[local-name()='ResultSummary']/*[local-name()='Counters']")
        if (-not $counters) { throw 'Contadores TRX ausentes.' }
        $resultNodes = @($trx.SelectNodes("//*[local-name()='UnitTestResult']"))
        $executed = [int]$counters.executed
        $passedNodes = @($resultNodes | Where-Object { $_.outcome -eq 'Passed' }).Count
        if ($executed -lt 1) { $blockers.Add('O filtro não executou nenhum teste; confira o nome do grupo.') }
        if ([int]$counters.failed -ne 0 -or $passedNodes -ne $executed) { $blockers.Add('Há testes falhos ou resultados individuais inconsistentes.') }
        if ([int]$counters.notExecuted -ne 0) { $blockers.Add('Há testes ignorados/não executados no filtro.') }
    } catch { $blockers.Add("TRX inválido: $($_.Exception.Message)") }
}
if ($dotnetExitCode -ne 0) { $blockers.Add("dotnet test terminou com exit code $dotnetExitCode.") }

$sourceAfter = Get-WorkflowSourceIdentity $repoRoot
if ($sourceAfter.sourceSnapshotHash -ne $sourceBefore.sourceSnapshotHash -or $sourceAfter.commit -ne $sourceBefore.commit) {
    $blockers.Add('Código ou HEAD mudou durante a execução; descarte esta evidência.')
}
$totalStopwatch.Stop()

$summary = [ordered]@{
    schemaVersion = 1
    validationType = 'focused-development-test-not-feature-gate'
    project = $Project
    filter = $Filter
    configuration = $Configuration
    sourceIdentity = $sourceBefore
    executed = $(if ($counters) { [int]$counters.executed } else { 0 })
    passed = $(if ($counters) { [int]$counters.passed } else { 0 })
    failed = $(if ($counters) { [int]$counters.failed } else { 0 })
    skippedOrNotExecuted = $(if ($counters) { [int]$counters.notExecuted } else { 0 })
    testCommandSeconds = [Math]::Round($stopwatch.Elapsed.TotalSeconds, 2)
    totalElapsedSeconds = [Math]::Round($totalStopwatch.Elapsed.TotalSeconds, 2)
    dotnetExitCode = $dotnetExitCode
    conclusion = $(if ($blockers.Count -eq 0) { 'passed-focused-tests' } else { 'failed' })
    blockers = $blockers.ToArray()
}
[IO.File]::WriteAllText((Join-Path $resultsRoot 'summary.json'), ($summary | ConvertTo-Json -Depth 8), [Text.UTF8Encoding]::new($false))
Write-Output ($summary | ConvertTo-Json -Depth 8)
Write-Output "Evidências desta execução: $resultsRoot"
if ($blockers.Count -gt 0) { exit 1 }
exit 0
