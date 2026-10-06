function Get-WorkflowSourceIdentity([string]$RepositoryRoot) {
    $commit = & git -C $RepositoryRoot rev-parse HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível identificar o HEAD.' }
    $status = @(& git -C $RepositoryRoot status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível identificar as alterações locais.' }
    $rawPaths = @(& git -C $RepositoryRoot -c core.quotepath=false ls-files --cached --others --exclude-standard -z) -join "`n"
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível enumerar os arquivos da revisão.' }
    $paths = @($rawPaths.Split([char]0) | Where-Object { $_ } | Sort-Object -Unique)
    $fingerprint = [Security.Cryptography.IncrementalHash]::CreateHash([Security.Cryptography.HashAlgorithmName]::SHA256)
    try {
        foreach ($relative in $paths) {
            $file = Join-Path $RepositoryRoot $relative
            $contentHash = if (Test-Path -LiteralPath $file -PathType Leaf) {
                (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash
            } else { 'DELETED' }
            $fingerprint.AppendData([Text.Encoding]::UTF8.GetBytes("$relative`0$contentHash`n"))
        }
        $snapshot = [Convert]::ToHexString($fingerprint.GetHashAndReset()).ToLowerInvariant()
    } finally { $fingerprint.Dispose() }
    [ordered]@{
        commit = [string]$commit
        workingTreeDirty = ($status.Count -gt 0)
        gitStatus = $status
        sourceSnapshotHash = $snapshot
    }
}
