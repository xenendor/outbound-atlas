# Outbound Atlas — Windows desktop

An unofficial, English-language, offline interactive atlas containing 443 locations across all four regions.

## Download and run

Download **Outbound-Atlas-Windows-x64.zip** from the GitHub Releases section. Extract the entire ZIP, then double-click **Outbound Atlas.exe**. Keep its DLLs and resources beside the executable. Windows 10/11 x64 is required. No browser, server, Python, Node.js, game installation or internet connection is needed to use the app.

Progress is private to each Windows account and stored under `%APPDATA%/Outbound Atlas`. Updating or moving the extracted application does not delete progress. Use **Export progress** for backups. To transfer your old browser progress, export it from the old map and use **Import** in this app. No personal progress is included in the distribution.

This release is unsigned; Windows may display an unknown-publisher warning.

## Build from source

On Windows, run `powershell -ExecutionPolicy Bypass -File .\build.ps1` from this folder. Internet access is needed only to download the pinned official Electron runtime (44.3.0); the build verifies its SHA-256 against the release checksums. The result is in `release/`. No npm dependencies are required. To rebuild, supply a fresh output directory: `-OutputDirectory .\release-next`.

## GitHub

Upload this source folder to a repository. Attach the generated Windows ZIP to a **GitHub Release**, so users can download and launch it directly. GitHub's source-code ZIP is intended for building, not for launching the application. `.gitignore` excludes runtime caches, builds and test data.

## Known data limitation

The Pacific Coast gnome **foths** uses extracted coordinates outside the original map artwork. It is marked **Position unverified**. The app does not invent a corrected location.

## Architecture

Electron loads the bundled interface directly from disk with `loadFile`; it opens no HTTP port. Remote requests and new windows are blocked. The renderer has no Node integration and runs with context isolation and sandboxing. Electron packaging reference: https://www.electronjs.org/docs/latest/tutorial/application-distribution

See THIRD_PARTY_NOTICES.md for asset provenance. This is not an official Outbound product.
