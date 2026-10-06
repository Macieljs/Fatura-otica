param(
    [ValidateSet('Bootstrap', 'Feature')]
    [string]$Level = 'Feature',
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    [switch]$NoRestore
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$runId = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$resultsRoot = Join-Path $repoRoot "artifacts/quality/backend/$runId"
[IO.Directory]::CreateDirectory($resultsRoot) | Out-Null
$projects = @('FaturaOtica.Architecture.Tests', 'FaturaOtica.Domain.Tests', 'FaturaOtica.Application.Tests', 'FaturaOtica.Integration.Tests')
$nativeFailures = [Collections.Generic.List[string]]::new()
. (Join-Path $PSScriptRoot 'source-identity.ps1')
$sourceIdentity = Get-WorkflowSourceIdentity $repoRoot
[IO.File]::WriteAllText((Join-Path $resultsRoot 'run-source.json'), ($sourceIdentity | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))

Push-Location -LiteralPath $repoRoot
try {
    $buildArgs = @('build', 'backend/FaturaOtica.slnx', '--configuration', $Configuration)
    if ($NoRestore) { $buildArgs += '--no-restore' }
    & dotnet @buildArgs
    if ($LASTEXITCODE -ne 0) {
        & (Join-Path $PSScriptRoot 'quality-gate.ps1') -Scope Backend -ResultsDirectory $resultsRoot -Level $Level -StageFailures @('backend build')
        exit 1
    }
    foreach ($project in $projects) {
        $projectFile = Join-Path $repoRoot "backend/tests/$project/$project.csproj"
        $projectResults = Join-Path $resultsRoot $project
        [IO.Directory]::CreateDirectory($projectResults) | Out-Null
        $testArgs = @('test', $projectFile, '--configuration', $Configuration, '--no-build', '--no-restore', '--logger', "trx;LogFileName=$project.trx", '--results-directory', $projectResults)
        if ($project -eq 'FaturaOtica.Domain.Tests' -and $Level -eq 'Feature') {
            $testArgs += @('--collect', 'XPlat Code Coverage', '--settings', (Join-Path $repoRoot 'backend/tests/coverage.runsettings'))
        }
        & dotnet @testArgs
        if ($LASTEXITCODE -ne 0) { $nativeFailures.Add($project) }
    }
    & (Join-Path $PSScriptRoot 'quality-gate.ps1') -Scope Backend -ResultsDirectory $resultsRoot -Level $Level -StageFailures $nativeFailures.ToArray()
    $gateExitCode = $LASTEXITCODE
    if ($nativeFailures.Count -gt 0) {
        Write-Output "Execuções dotnet falharam: $($nativeFailures -join ', ')"
        $gateExitCode = 1
    }
    Write-Output "Evidências desta execução: $resultsRoot"
} finally {
    Pop-Location
}
exit $gateExitCode
