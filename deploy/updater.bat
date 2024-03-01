@echo off

REM Set GitHub repository details
set "repo_owner=Matteo099"
set "repo_name=duerre-manager"
set "latest_release_url=https://api.github.com/repos/%repo_owner%/%repo_name%/releases/latest"

REM Set local file paths
set "current_version_file=current_version.txt"
set "latest_version_file=latest_version.txt"
set "jar_file=duerre-manager.jar"

REM Download latest release information from GitHub
curl -s -o latest_release.json %latest_release_url%

REM Extract latest version from JSON response
for /f "tokens=2 delims=:" %%a in ('type latest_release.json ^| findstr /C:"tag_name"') do (
    echo %%a | findstr /r /c:"[0-9].[0-9].[0-9]" > nul
    if not errorlevel 1 (
        set "latest_version=%%a"
    )
)

REM Check if latest version is different from current version
if not exist %current_version_file% (
    echo No current version found. Creating new file...
    echo %latest_version% > %current_version_file%
)

set /p current_version=<%current_version_file%
echo Current version: %current_version%
echo Latest version: %latest_version%

if "%current_version%" neq "%latest_version%" (
    REM Download latest version of the Java application
    echo Downloading latest version...
    curl -L -o %jar_file% https://github.com/%repo_owner%/%repo_name%/releases/latest/download/%jar_file%
    
    REM Update current version file
    echo Updating current version...
    echo %latest_version% > %current_version_file%
    echo Update complete.
) else (
    echo Your application is up to date.
)

REM Clean up temporary files
del latest_release.json

pause