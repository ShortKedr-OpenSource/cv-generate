param(
    [Parameter(Position = 0)]
    [string]$PatchFile,

    [switch]$Check
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'git is required to apply patches with this script.'
}

$repoRoot = (git rev-parse --show-toplevel).Trim()
if (-not $repoRoot) {
    throw 'This script must be run inside a git repository.'
}

Set-Location $repoRoot

$arguments = @('apply', '--whitespace=nowarn')
if ($Check) {
    $arguments += '--check'
}

$tempFile = $null
try {
    if ($PatchFile) {
        if (-not (Test-Path -LiteralPath $PatchFile)) {
            throw "Patch file not found: $PatchFile"
        }

        $resolvedPatchFile = (Resolve-Path -LiteralPath $PatchFile).Path
        $arguments += $resolvedPatchFile
    }
    else {
        $tempFile = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString() + '.diff')
        [Console]::In.ReadToEnd() | Set-Content -LiteralPath $tempFile -NoNewline
        $arguments += $tempFile
    }

    & git @arguments
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    if ($tempFile -and (Test-Path -LiteralPath $tempFile)) {
        Remove-Item -LiteralPath $tempFile -Force
    }
}
