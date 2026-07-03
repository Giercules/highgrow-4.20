@echo off
cd /d "%~dp0WinRel"
if not exist Bloom.exe (
    echo Bloom.exe not found. Run build.bat first.
    exit /b 1
)
if not exist "..\Plant01.hgp" if not exist "Plant01.hgp" (
    echo No Plant01.hgp found. Plant seeds in Bloom first, then rerun with /T.
)
start "" Bloom.exe %*