# HighGrow Reboot — MVP & Phased Roadmap

**Goal:** Rebuild HighGrow without Robbie, with appealing modern graphics, gamified progression, and purchasable upgrades — while preserving the core daily grow-room simulation.

**North star:** You can run something early, judge look-and-feel, and only then invest in full engine port.

---

## Phase 0 — Visual & UX Prototype (NOW)

**Purpose:** Validate art direction, UI layout, gamification *feel*, and room atmosphere before committing to Godot + sim port.

| Deliverable | Status |
|-------------|--------|
| Browser prototype (`prototype/`) | Runnable — no install |
| 3-pot grow room, dynamic lamp glow, procedural plants | Mock visuals |
| Care HUD (water, feed, light height, end day) | Interactive mock |
| Progression HUD (XP, level, coins, streak, shop) | Interactive mock |
| Journal toasts (replaces Robbie comments) | Interactive mock |

**Run:**

```bat
cd prototype
run.bat
```

Or open `prototype/index.html` in Chrome/Edge.

**Exit criteria (your sign-off):**

- [ ] Room feels cozy and “grow-room real,” not clip-art
- [ ] Plants are the visual focus (not a mascot)
- [ ] Daily loop is obvious in under 30 seconds
- [ ] Upgrade shop feels rewarding, not pay-to-win sloppy
- [ ] You’d be proud to screenshot it for itch/Steam

**Duration estimate:** 1–2 weeks of art iteration on top of the scaffold (palette, backgrounds, leaf art, UI polish).

---

## Phase 1 — Engine Vertical Slice (MVP Core)

**Stack:** Godot 4 (2D) + `highgrow_sim` C++ library (ported `Calc.c`, `NodeCalc.c`, `PlantMem`).

**Scope — must ship:**

| System | Detail |
|--------|--------|
| **Simulation** | Real calendar days, `GROWDAY` care, node growth, 1 room / 3 pots |
| **Strains** | 4 launch strains (expand to 12 in Phase 2) |
| **Care** | Visit, water, NPK+Ca, light on/off, light height, basic prune |
| **Rendering** | Draw-list from `GRCalcDrawNodes` → Godot sprites + stem meshes |
| **Saves** | `%USERPROFILE%/Documents/HighGrow/saves/` — no registry |
| **Journal** | Context tips from `tips.json` (ported `comments.dll` text) |
| **Vacation mode** | Auto water/feed/light rules from `GROWROOM` |
| **Harvest** | Weigh, potency, plant log entry |
| **Robbie** | Removed — no DLL deps |

**Explicitly out of MVP:**

- Breeding, pests, economy market, multi-room campaign, mods, multiplayer

**Exit criteria:**

- [ ] Import or recreate a plant; grow 14+ real days with correct stage transitions
- [ ] `/T`-style debug fast-forward in dev build
- [ ] 30-minute play session without crashes
- [ ] Save survives restart

**Duration estimate:** 8–12 weeks (sim port + Godot scene + UI).

---

## Phase 2 — MVP Launch (Feature-complete reboot)

Everything needed for a public **1.0** on itch.io / Steam early access.

### Graphics (appeal tier)

| Asset | Standard |
|-------|----------|
| Room backgrounds | 2× PNG, parallax layers (wall, floor, props) |
| Lamps | MH / HPS / LED with animated bloom + color temperature |
| Pots | 3 tiers (basic → premium) visible mesh/sprite |
| Plants | Per-strain leaf atlases; bud stages; stress tints |
| UI | Dark botanical theme, glass panels, animated gauges |
| FX | Light dust particles, water sparkle, harvest flash |

### Gameplay

| Feature | Notes |
|---------|-------|
| 12 strains | Full `PLANTSEED` data |
| Room editor | Lamp, pot, soil, shade — simplified from `GrowEdit` |
| Training | Player-chosen topping + LST (replaces random prune) |
| Charts | Health, moisture, pH, potency history |
| Garage | Seed collection browser |
| Photo mode | Hide UI, capture PNG |

### Gamification (launch set)

| System | Mechanic |
|--------|----------|
| **Grow XP** | Daily visit + care actions → level ups |
| **Grow Coins** | Harvest quality × weight; spent in shop |
| **Streaks** | Consecutive daily visits → XP multiplier |
| **Achievements** | ~20 launch achievements |
| **Challenges** | Weekly rotating goal (“Finish flower at 85% health”) |

### Upgrade shop (launch catalog)

| Category | Examples | Effect |
|----------|----------|--------|
| **Lighting** | Cool hood, air-cooled reflector, dimmable ballast | Temp ↓, yield ↑ |
| **Pots** | Smart pot, air prune pots | Moisture stability |
| **Nutrients** | Pro line, calmag add-on | pH stability, potency ceiling |
| **Climate** | Clip fan, humidifier | Humidity control band |
| **Room** | Mylar upgrade, CO₂ bucket (late unlock) | Light efficiency, growth rate |
| **Cosmetic** | Posters, floor mats, wall color | No sim effect — expression |

Upgrades are **purchased with Grow Coins** earned in-game. Optional cosmetic IAP only after 1.0 metrics; sim-affecting gear is never real-money.

**Exit criteria:**

- [ ] 10 playtesters complete seed → harvest without docs
- [ ] Average session 10–20 min/day fits design
- [ ] Shop upgrades noticeably change room look + stats
- [ ] Steam/itch build pipeline works

**Duration estimate:** 12–16 weeks after Phase 1.

---

## Phase 3 — Depth & Retention

| Feature | Gamification tie-in |
|---------|----------------------|
| **Skill tree** | Horticulture perks (unlock with XP): “VPD Awareness,” “Gentle Defoliate” |
| **Pests & mold** | Events → shop items (neem, dehumidifier rush) |
| **Medium types** | Coco, dwc — unlock via level |
| **Breeding** | Cross parents → new seed genetics; “Genetics Lab” upgrade |
| **Scenarios** | Career mode missions with coin/XP rewards |
| **Multiple sites** | 2nd room slot — purchase property upgrade |
| **Seasonal events** | Limited seeds, leaderboard challenges |

---

## Phase 4 — Platform & Community

| Feature | Notes |
|---------|-------|
| Mod support | JSON strains, rooms, tips |
| Cloud saves | Optional Steam Cloud |
| Mobile companion | Read-only stats + journal (stretch) |
| Leaderboards | Weekly harvest score |
| Content pipeline | Aseprite/Spine → Godot import docs |

---

## Gamification Design Principles

1. **Earn power, don’t buy wins** — Coins from play; upgrades widen margins, not skip skill.
2. **Visible upgrades** — Better gear shows on screen (new lamp mesh, fan spinning).
3. **Meaningful dailies** — XP for *good* care, reduced for neglect (not zero — avoid feel-bad).
4. **Journal over mascot** — Tips triggered by mistakes/rewards, not dancing DLL.
5. **Harvest is the payday** — Big coin/XP spike + achievement fanfare.

### Progression curve (sketch)

| Level | Unlock |
|-------|--------|
| 1 | Tutorial room, 1 strain |
| 3 | Shop: clip fan |
| 5 | 2nd strain, training (topping) |
| 8 | Room editor full |
| 10 | 2nd grow room property |
| 15 | Breeding bench |
| 20 | Advanced climate (CO₂) |

---

## Technical Architecture

```
highgrow_sim/          C++ — Calc, NodeCalc, saves (unit tested)
highgrow_godot/        Godot 4 project — scenes, UI, audio
content/               strains.json, tips.json, upgrades.json, atlases
prototype/             Phase 0 browser mock (this repo)
legacy/                HighGrow 420/ — reference only
```

**Draw pipeline:**

```
Sim → PlantState → DrawList (segments, sprites, tints) → Renderer
```

**Data-driven upgrades (`upgrades.json`):**

```json
{
  "id": "reflect_air_cooled",
  "name": "Air-Cooled Reflector",
  "cost": 450,
  "slot": "lamp",
  "effects": { "temp_delta": -3, "yield_pct": 5 },
  "sprite": "gear/reflect_ac.png"
}
```

---

## Your Decision Checklist (after Phase 0)

| Question | If YES → | If NO → |
|----------|----------|---------|
| Does the room lighting feel right? | Lock palette + commission/finish room art | Iterate prototype backgrounds |
| Are plants readable and attractive? | Proceed with atlas pipeline | Prototype alternate leaf styles |
| Is the HUD calm, not cluttered? | Freeze UI layout for Godot | Simplify panels |
| Does the shop excite you? | Implement `upgrades.json` in Phase 1 | Rework economy numbers in mock |

---

## Immediate Next Steps

1. **Run** `prototype/run.bat` and click through a full mock day.
2. **Note** what feels off (colors, plant size, UI density) — tune prototype first.
3. **When signed off** → start `highgrow_sim` extraction PR (Calc + NodeCalc tests).
4. **Parallel** → finalize 2× room background art in prototype assets folder.

---

## Reference

| Legacy file | Reboot role |
|-------------|-------------|
| `Calc.c` / `NodeCalc.c` | Port to `highgrow_sim` |
| `GrowRoom.c` draw order | Godot layer + draw list |
| `Global.h` structs | Sim API contract |
| `activity.c` | Replaced by care dashboard |
| `Robbie.dll` / `comments.dll` | **Removed** — journal + tips JSON |
| `GrowEdit.c` | Room editor scene (Phase 2) |