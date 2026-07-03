# HighGrow 4.20

Source code of the original Windows cannabis grow simulator, developed by my close friend.

<img width="800" height="600" alt="HighGrow screenshot" src="https://github.com/user-attachments/assets/8f1bd1b3-46b7-4c1e-910f-471ea746a03d" />

## About this fork

This repository is a fork of [mikebyrne3280-code/highgrow-4.20](https://github.com/mikebyrne3280-code/highgrow-4.20). The `feature/modern-build` branch adds tooling and fixes so the game builds and runs on modern Windows with current Visual Studio Build Tools.

Changes on `feature/modern-build`:

| Area | What changed |
|------|----------------|
| **Build** | `HighGrow 420/build.bat` and `run.bat` — no legacy VC6 project required |
| **MFC removal** | `Picture.cpp/h`, `JPGView.cpp`, `StdAfx.h` — Win32 + OLE `IPicture` instead of MFC/ATL |
| **SDK conflict** | `DIBAPI.H` — renamed `PrintWindow` → `DIBPrintWindow` |
| **Stale include** | `Internet.c` — removed obsolete `iostream.h` |
| **Date bug** | `Global.c` — fixed `GLPreviousDate` month handling (1–12 ↔ `tm_mon`) |
| **Test mode** | `Calc.c/h`, `highgrow.C/H` — `/T` and `/T:nnn` fast-forward growth for dev/testing |
| **Git** | `.gitignore` — ignores build output (`WinRel/`), saves (`*.hgp`, `*.hgg`), and object files |

Upstream PR: [mikebyrne3280-code/highgrow-4.20#1](https://github.com/mikebyrne3280-code/highgrow-4.20/pull/1)

## Prerequisites

- **Windows** (x86 build)
- **Visual Studio Build Tools** with the **Desktop development with C++** workload  
  Tested with VS 2019 Build Tools; newer VS versions are also detected by `build.bat`.

## Build

From a Developer Command Prompt or any shell where `cl` is available:

```bat
cd "HighGrow 420"
build.bat
```

On success, the executable and runtime files are written to `HighGrow 420/WinRel/`:

- `HighGrow.exe`
- `Robbie.dll`, `comments.dll`
- `highgrow.chm`, `The Garage.hgb` (if present in the source folder)

## Run

```bat
cd "HighGrow 420"
run.bat
```

Or launch directly:

```bat
cd "HighGrow 420\WinRel"
HighGrow.exe
```

Plant save files (`Plant01.hgp`, etc.) are stored in the app's **startup directory** (see *Options → Startup in* in the game). That directory is often the repo parent folder, not necessarily `WinRel/`.

## Test mode (`/T`)

For development and testing, you can fast-forward existing plants through ideal care to a target grow day. This simulates plants **1–3** only; they must already exist as save files (plant seeds in the game first).

```bat
run.bat /T          REM auto target (flowering stage)
run.bat /T:220      REM fast-forward to grow day 220
```

If HighGrow is already running, close it before re-running `/T`, or the new instance will forward the command to the existing window.

## Registration notes

The title bar shows **Freeware Version 4.20** — that is product branding, not an “unregistered” flag.

In this source tree, `gbRegistered` and `gbPaid` default to `TRUE` in `Global.c`, so the 60-day trial limit and paid-feature gates are off for local builds. The original registration UI is largely commented out in 4.20.

## Repository layout

| Path | Description |
|------|-------------|
| `HighGrow 420/` | Application source, resources, and build scripts |
| `HighGrow 420/WinRel/` | Build output (gitignored; created by `build.bat`) |
| `HighGrow 420/build.bat` | Compile and link with MSVC |
| `HighGrow 420/run.bat` | Launch from `WinRel/` with optional command-line args |

## Remotes

| Remote | URL |
|--------|-----|
| `origin` | [Giercules/highgrow-4.20](https://github.com/Giercules/highgrow-4.20) (this fork) |
| `upstream` | [mikebyrne3280-code/highgrow-4.20](https://github.com/mikebyrne3280-code/highgrow-4.20) |

To pull upstream changes:

```bat
git fetch upstream
git merge upstream/main
```

## Original build (legacy)

The original VC6 project files (`HIGHGROW.dsp`, `highgrow.MAK`) are still in `HighGrow 420/` for reference. They are not required for the modern `build.bat` workflow.