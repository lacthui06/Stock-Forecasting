# PowerShell version of idea-refine initialization script for Windows
$ErrorActionPreference = "Stop"

$ideasDir = "docs/ideas"

if (-not (Test-Path $ideasDir)) {
    New-Item -ItemType Directory -Path $ideasDir -Force | Out-Null
    [Console]::Error.WriteLine("Created directory: $ideasDir")
} else {
    [Console]::Error.WriteLine("Directory already exists: $ideasDir")
}

Write-Output ('{"status": "ready", "directory": "' + $ideasDir.Replace('\', '/') + '"}')
