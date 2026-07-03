@echo off
setlocal enabledelayedexpansion

set "VCVARS=C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"
if not exist "%VCVARS%" (
    set "VCVARS=C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"
)
if not exist "%VCVARS%" (
    echo ERROR: Visual Studio Build Tools not found.
    echo Install "Desktop development with C++" from Visual Studio Build Tools.
    exit /b 1
)

call "%VCVARS%" x86 >nul
if errorlevel 1 exit /b 1

set "OUTDIR=WinRel"
set "CFLAGS=/nologo /MD /W3 /EHsc /O2 /DNDEBUG /DWIN32 /D_WINDOWS /D_MBCS /D_CRT_SECURE_NO_WARNINGS"
set "CXXFLAGS=/nologo /MD /W3 /EHsc /O2 /DNDEBUG /DWIN32 /D_WINDOWS /D_MBCS /D_CRT_SECURE_NO_WARNINGS"
set "LIBS=version.lib kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib comctl32.lib winmm.lib htmlhelp.lib wininet.lib"

if not exist "%OUTDIR%" mkdir "%OUTDIR%"

set SOURCES=activity.c Buds.c Calc.c Chart.c clock.c Comments.c crypt.c DibAPI.c DiBitmap.c Global.c GrowEdit.c GrowRoom.c Harvest.c highgrow.C History.c Internet.c Leaves.c LogExport.c midi.c NodeCalc.c Password.c PlantLog.c PlantMem.c PlantSeed.c Registry.c RobbieWin.c SeedImp.c SeedList.c SeedLog.c ToolBar.c TrayIcon.c Vacation.c VersInfo.c Zoomer.c JPGView.cpp Picture.cpp

echo Compiling sources...
for %%F in (%SOURCES%) do (
    echo   %%F
    if /I "%%~xF"==".cpp" (
        cl %CXXFLAGS% /Fo"%OUTDIR%\%%~nF.obj" /c "%%F"
    ) else (
        cl %CFLAGS% /Fo"%OUTDIR%\%%~nF.obj" /c "%%F"
    )
    if errorlevel 1 exit /b 1
)

echo Compiling resources...
rc /nologo /l 0x409 /fo"%OUTDIR%\highgrow.res" /d NDEBUG highgrow.RC
if errorlevel 1 exit /b 1

echo Linking HighGrow.exe...
link /nologo /subsystem:windows /incremental:no /out:"%OUTDIR%\HighGrow.exe" %LIBS% ^
    "%OUTDIR%\activity.obj" "%OUTDIR%\Buds.obj" "%OUTDIR%\Calc.obj" "%OUTDIR%\Chart.obj" ^
    "%OUTDIR%\clock.obj" "%OUTDIR%\Comments.obj" "%OUTDIR%\crypt.obj" "%OUTDIR%\DibAPI.obj" ^
    "%OUTDIR%\DiBitmap.obj" "%OUTDIR%\Global.obj" "%OUTDIR%\GrowEdit.obj" "%OUTDIR%\GrowRoom.obj" ^
    "%OUTDIR%\Harvest.obj" "%OUTDIR%\highgrow.obj" "%OUTDIR%\History.obj" "%OUTDIR%\Internet.obj" ^
    "%OUTDIR%\Leaves.obj" "%OUTDIR%\LogExport.obj" "%OUTDIR%\midi.obj" "%OUTDIR%\NodeCalc.obj" ^
    "%OUTDIR%\Password.obj" "%OUTDIR%\PlantLog.obj" "%OUTDIR%\PlantMem.obj" "%OUTDIR%\PlantSeed.obj" ^
    "%OUTDIR%\Registry.obj" "%OUTDIR%\RobbieWin.obj" "%OUTDIR%\SeedImp.obj" "%OUTDIR%\SeedList.obj" ^
    "%OUTDIR%\SeedLog.obj" "%OUTDIR%\ToolBar.obj" "%OUTDIR%\TrayIcon.obj" "%OUTDIR%\Vacation.obj" ^
    "%OUTDIR%\VersInfo.obj" "%OUTDIR%\Zoomer.obj" "%OUTDIR%\JPGView.obj" "%OUTDIR%\Picture.obj" ^
    "%OUTDIR%\highgrow.res"
if errorlevel 1 exit /b 1

echo Copying runtime files...
copy /Y Robbie.dll "%OUTDIR%\" >nul
copy /Y comments.dll "%OUTDIR%\" >nul
if exist highgrow.chm copy /Y highgrow.chm "%OUTDIR%\" >nul
if exist "The Garage.hgb" copy /Y "The Garage.hgb" "%OUTDIR%\" >nul

echo.
echo Build succeeded: %OUTDIR%\HighGrow.exe
echo Run from the output folder:  cd %OUTDIR% ^&^& HighGrow.exe
exit /b 0