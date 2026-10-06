param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$GraphifyArgs
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$launcher = Get-Command graphify -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $launcher) {
    throw 'Graphify não encontrado no PATH. Instale com: python -m pip install graphifyy'
}
if (-not $GraphifyArgs -or $GraphifyArgs.Count -eq 0) { $GraphifyArgs = @('--help') }

Push-Location -LiteralPath $projectRoot
try {
    & $launcher.Source @GraphifyArgs
    $commandExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $commandExitCode