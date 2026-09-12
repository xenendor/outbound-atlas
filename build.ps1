param([string]$OutputDirectory = (Join-Path $PSScriptRoot 'release'))
$ErrorActionPreference = 'Stop'
$version = '44.3.0'
$archiveName = "electron-v$version-win32-x64.zip"
$cache = Join-Path $PSScriptRoot '.cache'
New-Item -ItemType Directory -Force -Path $cache,$OutputDirectory | Out-Null
$archive = Join-Path $cache $archiveName
$base = "https://github.com/electron/electron/releases/download/v$version"
if (!(Test-Path -LiteralPath $archive)) { Invoke-WebRequest "$base/$archiveName" -OutFile $archive }
$checksums = (Invoke-WebRequest "$base/SHASUMS256.txt").Content
if ($checksums -is [byte[]]) { $checksums = [System.Text.Encoding]::UTF8.GetString($checksums) }
$expected = (($checksums -split "`n" | Where-Object { $_.Trim().EndsWith(" *$archiveName") -or $_.Trim().EndsWith(" $archiveName") }) -split '\s+')[0]
if (!$expected -or (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw 'Electron checksum mismatch.' }
$destination = Join-Path $OutputDirectory 'Outbound-Atlas-Windows-x64'
if (Test-Path -LiteralPath $destination) { throw "Output already exists: $destination. Choose a new OutputDirectory." }
Expand-Archive -LiteralPath $archive -DestinationPath $destination
Rename-Item -LiteralPath (Join-Path $destination 'electron.exe') -NewName 'Outbound Atlas.exe'
$appFolder = Join-Path $destination 'resources/app'
New-Item -ItemType Directory -Force -Path $appFolder | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'main.cjs'),(Join-Path $PSScriptRoot 'package.json') -Destination $appFolder
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'ui') -Destination $appFolder -Recurse
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'README.md'),(Join-Path $PSScriptRoot 'THIRD_PARTY_NOTICES.md') -Destination $destination
Compress-Archive -LiteralPath $destination -DestinationPath (Join-Path $OutputDirectory 'Outbound-Atlas-Windows-x64.zip')
Write-Host "Ready: $destination"
