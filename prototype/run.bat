@echo off
cd /d "%~dp0"
echo.
echo  HighGrow Reboot — Phase 0 Visual Prototype
echo  Starting local server (ES modules require http://)...
echo.

where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  Open: http://localhost:3456
    echo  Press Ctrl+C to stop.
    echo.
    start "" "http://localhost:3456"
    npx --yes serve -l 3456 .
    exit /b 0
)

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  Open: http://localhost:3456
    echo  Press Ctrl+C to stop.
    echo.
    start "" "http://localhost:3456"
    python -m http.server 3456
    exit /b 0
)

echo ERROR: Install Node.js or Python to run the prototype server.
echo Alternatively: open index.html in a browser that allows local modules.
exit /b 1