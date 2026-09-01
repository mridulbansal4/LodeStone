# Lodestone — Interactive Prototype PRD

**Document type:** Implementation PRD for the hackathon prototype
**Product:** Lodestone — *Your phone remembers the walk, not the pin.*
**Deliverable this PRD describes:** a publicly hosted, playable web app that simulates the Lodestone experience
**Status:** Ready to build
**Last updated:** 2026-09-01

> **Assumptions callout.** Where this PRD had to make a judgement call, the decision is recorded inline as **[Assumption]** and collected in the appendix. Every one of them is a reversible engineering choice, not a product change.

---

## 1. Executive summary

Lodestone is a product concept for iQOO (Android): the phone automatically remembers the *walk away from your parked car* using on-device motion and magnetic sensing, then guides you back — with no GPS, no beacons, no venue app, no camera, and no user effort.

The name is the thesis. A lodestone is naturally magnetised rock, the original compass — and in a parking garage the magnetic field is far too distorted to point north, which is exactly what makes it a stable fingerprint of *place* (§17.1).

The **prototype** described here is **not** that product. It is a hosted, interactive web app that lets a judge *play* the experience in a browser in under five minutes. The judge drives a small avatar through a large multi-floor isometric mall while a **simulated smartphone**, rendered beside the world in ordinary web UI, builds a route memory in real time. Later the judge presses **Find My Car**, the phone flips into return-navigation mode, and the judge walks back — including a deliberate wrong turn, an honest off-route warning, a recovery, and a **Car Found** climax.

**What it proves**

- The *interaction model* works: zero-effort recording, then confident, honest, turn-by-turn return guidance.
- The *product surface* is designed: a real phone UI with a route-memory map, floor awareness, distance, and a confidence state.
- The *narrative* lands: park → walk → memory → explore → find → recover → found, in one continuous playable take.

**What it explicitly does not prove**

- Real indoor localization. Every number the prototype shows — distance, steps, turns, floors, confidence — is **derived from known game state, not from sensors**. The prototype UI labels this. The detailed real sensor architecture (PDR, magnetic fingerprinting, DTW, floor-event classification, auto-trigger) lives in the **PPT** and is summarised in §17 for continuity.

**Audience:** hackathon judges (playing), the build team (implementing), and the pitch presenter (recording the demo video).

**One-sentence success criterion:** a judge who has never seen the product opens a URL, plays for three minutes with no instructions beyond an on-screen hint, and can explain the idea back to you.

---

## 2. Prototype goals and non-goals

### 2.1 Goals

| # | Goal | Acceptance signal |
|---|---|---|
| G1 | Judge-playable from a public URL, no install/login/permissions | URL opens in a cold browser profile; first input works within 5 s |
| G2 | Genuinely interactive, not a video or a fixed click-through | Judge can walk anywhere in the world; no scripted path is enforced |
| G3 | Large mall world that reads as real exploration on video | ≥ 3 floors, ≥ 120 s of walking to cross the full route at normal speed |
| G4 | A convincing simulated phone beside the world with an isometric-looking map | Phone is legible at 1080p video scale; map shows player, route, car, floor |
| G5 | Route memory is derived from the judge's *actual* journey | Replaying a different walk produces a visibly different remembered route |
| G6 | Honest confidence + off-route + recovery behaviour | Wrong turn triggers off-route within 2 s; returning to route recovers within 2 s |
| G7 | Runs and demos on the iQOO phone browser as a PWA | Installable, offline shell, playable with on-screen touch controls |
| G8 | Reliable reset/replay for repeated video takes | Full reset to Landing in one keypress/tap, < 1 s, no page reload needed |

### 2.2 Non-goals (explicit out of scope)

Not built, not stubbed, not implied:

- production backend
- authentication or accounts
- cloud infrastructure
- databases
- real indoor localization
- production sensor fusion
- real PDR or DTW *(a purely cosmetic magnetic-trace squiggle is allowed for visual flavour and must be labelled simulated)*
- camera or OCR — **deliberately removed from the product direction; do not reintroduce in any form**
- complex AI infrastructure
- full 3D rendering
- multiplayer, save files, leaderboards, analytics, telemetry

### 2.3 Product principles that must survive into the prototype

1. **Zero user effort** — recording starts automatically; the judge is never asked to "start tracking".
2. **No camera / no OCR** — anywhere.
3. **Confidence-aware honesty** — a low-confidence state says so and falls back to showing the stored route.
4. **No invented ground truth** — no fabricated slot numbers. Say "the recorded parking area", "your route segment".
5. **On-device framing** — no server, no account, no network calls after first load.

---

## 3. Final user/judge experience

Written as a narrative a developer can build against. Numbers in brackets are the 15 judge steps.

**[1] Open the URL.** A landing screen: product name, tagline *"Your phone remembers the walk, not the pin."*, one line of context, and a single large **Start Demo** button. A small footer badge reads **"Simulation — no real sensors are used."** Controls are shown as a compact key legend (WASD / arrows, E for elevator, F for Find My Car, R to restart).

**[2] Click Start Demo.** A short (~1.2 s) transition: the camera drops into the B3 parking level, centred on a parked car with the avatar standing beside the driver's door. The phone, docked to the right, is dark, then wakes.

**[3] Enter the mall world.** The phone shows **Parked / Ready**: "Car parked on B3." plus a hint — *"Just walk. Your phone is already remembering."* No button to press. This is the zero-effort principle made visible.

**[4] Control the avatar.** WASD/arrows move; the camera follows smoothly. On touch, a virtual joystick appears bottom-left and context buttons bottom-right. Movement is immediate and responsive — this is the first thing a judge tests and the first thing that can lose them.

**[5] Explore freely.** No corridor is off-limits. Stores, atrium, food court, escalator hall are all walkable. Nothing forces the "correct" path.

**[6] Watch the trail build.** Two synchronised things happen as the judge walks:

- In the **mall world**, a glowing breadcrumb trail is laid down behind the avatar.
- In the **phone**, the isometric mini-map draws the same trail, and a live stat strip updates: distance walked, step count, turns taken, current floor, elapsed time. A small "Remembering your walk" pill pulses. Each stat carries the tiny **sim** marker (§4.6).

**[7] Move between floors.** Walking onto an elevator pad and pressing **E** (or the on-screen **Use** button) plays a ~1.5 s floor transition: the world fades, a floor indicator ticks B3 → L1 → L2, and the phone logs a **floor event** card — "Elevator · B3 → L1". Stairs work the same way with a walk-up animation instead of doors.

**[8] Choose Find My Car.** Available at any time from the phone's persistent bottom action button, or **F**. If the judge has walked less than the minimum memory distance (§7.8), the button is present but shows "Keep walking — building memory".

**[9] The phone transforms.** A ~1 s morph: the live-recording UI slides away, the map re-centres and zooms to fit the whole remembered route, and the header becomes **Find My Car** with the car icon pinned at the far end.

**[10] See the remembered route.** Derived from the judge's *actual* walk — not a preset path. The phone shows the **Memory Created / Route Overview** summary in natural language:

> *"Parked on B3. You walked about 180 m and took the elevator up to L2. Roughly a 4 minute walk back."*

All figures come from the recorded simulation state.

**[11] Follow the route back.** The route renders as a bright directional ribbon in **both** the mall world and the phone map. The phone gives one instruction at a time — "Continue 24 m", "Turn left ahead", "Take the elevator down to B3" — plus a distance-remaining readout and a confidence chip reading **High**.

**[12] Take a wrong turn deliberately.** Once the avatar exceeds the off-route threshold (§7.10), within ~1.5 s the confidence chip drops to **Low** and the phone shows **Off Route**: *"You've stepped away from the remembered route. Showing the full route instead."* The turn-by-turn instruction is replaced by the whole stored route drawn dimmed — the honesty principle: it does not guess.

**[13] Reconnect.** Walking back within the recovery radius restores **Route Recovered**: a brief green confirmation, confidence back to **High**, and turn-by-turn resumes from the nearest route node ahead.

**[14] Reach the car.** Entering the arrival radius on the correct floor triggers **Car Found**: the world spotlights the car, the phone plays a success state with the run's summary — total distance, walk time, floors crossed, time to return — and a caption reading *"Your route was remembered from motion alone. No GPS. No beacons. No camera."*

**[15] Restart/replay.** A **Replay** button on the Car Found card, and **R** anywhere, resets to Landing in under a second without a page reload. World, trail, memory, and phone state all clear.

---

## 4. Visual/interaction specification

### 4.1 Art direction

Polished, playful, premium, futuristic. Flat-shaded isometric geometry with soft ambient occlusion baked into the tiles, a dark navy-charcoal base, and one electric accent colour carrying all "memory" meaning. No skeuomorphism, no photo textures, no third-party branding or assets. Do not imitate Pokémon, Google Maps, or any shipped product's visual identity — they are high-level interaction references only.

### 4.2 Camera

- Isometric-style ortho projection, fixed 2:1 tile ratio.
- Smooth follow with damping: `camera.pos += (target - camera.pos) * 0.12` per frame at 60 fps. **[Assumption]**
- Dead-zone of 48 px around the avatar so micro-movements do not jitter the frame.
- Zoom: mouse wheel / pinch, clamped to `0.6×–1.6×`, default `1.0×`. Zoom-to-fit on Route Overview.
- Camera never rotates. One orientation keeps the world readable and the tile art cheap.

### 4.3 Controls

**Keyboard (primary)**

| Input | Action |
|---|---|
| `W A S D` / arrows | Move (8-directional, screen-relative) |
| `Shift` (hold) | Walk slowly — useful for precise off-route demos |
| `E` | Use elevator / stairs when on a transition pad |
| `F` | Find My Car |
| `R` | Restart |
| `+` `-` / wheel | Zoom |
| `Esc` | Pause overlay with the control legend |

**Touch fallback (mobile viewport)**

- Bottom-left virtual joystick, 120 px diameter, 44 px dead-zone, appears on first touch.
- Bottom-right context button stack: **Use** (only when on a pad), **Find My Car**, **Restart**.
- All touch targets ≥ 44 × 44 px.

### 4.4 Motion

- Avatar: 8-frame walk cycle or a simple squash-and-bounce; either is acceptable. **[Assumption]** Bounce is cheaper and reads fine at video scale.
- Trail: dots dropped every `TRAIL_SAMPLE_DIST` (§7.3), each fading in over 200 ms, then holding at 60 % opacity.
- Phone state transitions: 250–400 ms ease-out; the Find-My-Car morph is 800–1000 ms.
- Floor transition: 1500 ms total (400 fade-out, 700 hold with floor ticker, 400 fade-in).
- All motion respects `prefers-reduced-motion`: transitions collapse to 0–100 ms cross-fades; the trail still draws.

### 4.5 Readability at video resolution

The demo will be recorded at 1080p and may be watched on a phone. Therefore:

- Minimum on-screen text size in the phone UI: **14 px at 1× phone scale**, and the phone frame must occupy ≥ 26 % of the viewport width on desktop.
- Route ribbon width ≥ 6 px in the world, ≥ 3 px in the phone map.
- The primary instruction line in the phone uses ≥ 20 px semibold.
- Contrast of all text against its background ≥ 4.5:1.
- **Check:** screenshot the app, downscale to 640 px wide, and confirm the phone's instruction line is still readable.

### 4.6 Colour and typography

| Token | Use | Value **[Assumption]** |
|---|---|---|
| `--bg-deep` | World void, phone chassis | `#0B0F1A` |
| `--bg-surface` | Phone screen, panels | `#121827` |
| `--floor` | Walkable tiles | `#1E2740` |
| `--wall` | Structure, store blocks | `#2A3454` |
| `--accent` | Memory trail, route ribbon, primary CTA | `#4DE1C1` |
| `--accent-warm` | Car marker, arrival glow | `#FFB454` |
| `--warn` | Off-route, low confidence | `#FF6B6B` |
| `--text-hi` / `--text-lo` | Primary / secondary text | `#EAF0FF` / `#93A0C0` |

Typography: one geometric/neo-grotesque sans for everything (Inter, or the system UI stack). Numerals tabular in the stat strip so figures do not jitter while walking. **[Assumption]**

**Colour is never the only signal.** Off-route also changes the icon, the text, and the route rendering style; confidence also carries a word (High / Medium / Low).

The **sim marker**: a 10 px uppercase `SIM` chip in `--text-lo` next to every derived figure, plus the persistent "Simulation — no real sensors are used" badge in the header. This is how the prototype stays honest on screen without nagging.

### 4.7 Accessibility basics

- Full keyboard operability; no action requires a mouse.
- Visible focus ring on every interactive control.
- `prefers-reduced-motion` honoured as above.
- Phone state changes announced through a polite `aria-live` region ("Off route. Showing full route.").
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for meaningful graphics.
- Not in scope: full screen-reader navigation of the game world. Stated honestly rather than claimed.

---

## 5. Mall/world design

### 5.1 Scale, and how "large" is achieved cheaply

- **Tile grid.** Each floor is a `120 × 90` grid of `1 m` logical tiles → 120 m × 90 m per floor. Rendered as 64 × 32 px isometric diamonds. **[Assumption]**
- **Tiling, not painting.** ~14 tile types (floor, corridor, wall, storefront, glass, planter, atrium void, road marking, parking bay, elevator pad, stair pad, sign, kiosk, decal). The whole mall is data — a per-floor 2D array — not hand-placed sprites.
- **Culling.** Only tiles inside the camera frustum + 2-tile margin are drawn. Typical draw ≈ 900–1400 tiles per frame.
- **Layered draw order.** `floor → decals → trail → route ribbon → props/walls (y-sorted) → avatar (y-sorted) → overlays`. Y-sorting applies only to the props+avatar layer.
- **Static bake (optional).** If frame time exceeds budget, pre-render each floor's static layers to offscreen canvases in 512 px chunks and blit. **[Assumption]** An optimisation, not a day-one requirement.

### 5.2 Floors

```
   L2  SHOPPING     -- cinema, apparel court, skybridge, balcony over atrium
   L1  MALL         -- main concourse, food court, entrance hall, atrium base
   B3  PARKING      -- bays, ramps, columns, the parked car
```

**[Assumption]** L3 is cut. Three floors give one elevator ride up and one down — enough for the floor-transition story — and a fourth costs map-authoring time without adding narrative.

**B3 — Parking (the origin)**

- ~120 parking bays in 6 rows, structural columns every 8 m.
- The player's car sits in a bay roughly 35 m from the elevator lobby, deliberately *not* adjacent to it — the walk must be long enough to be a memory.
- Landmarks: lift lobby, a ramp mouth (visually blocked), a payment kiosk, and a dead-end service corridor — a good wrong-turn trap for the demo.

**L1 — Mall concourse**

- Wide central concourse along the long axis, storefronts both sides.
- Food court in the north-east quadrant with seating clusters.
- Central atrium void with a railing — visually connects L1 and L2.
- Entrance hall to the south with daylight spill.

**L2 — Shopping**

- Balcony ring around the atrium void.
- Cinema block west, apparel court east, a skybridge crossing the atrium.
- The natural "destination" the judge wanders to before pressing Find My Car.

### 5.3 Vertical transitions

| ID | Type | Floors | Placement |
|---|---|---|---|
| `elev-main` | Elevator | B3 ↔ L1 ↔ L2 | Central lobby, identical grid coords on all three floors |
| `stair-north` | Stairs | L1 ↔ L2 | North end of the concourse |
| `esc-atrium` | Escalator | L1 ↔ L2 | Atrium edge — a second, more scenic way up |

Each is a **transition pad**: a 2 × 2 tile region showing a floating prompt when the avatar stands on it. Keeping `elev-main` at identical coordinates across floors makes the return route trivially continuous through the shaft.

### 5.4 Walkable graph

- Walkability is a per-tile boolean derived from tile type — a `120 × 90` bitmask per floor.
- Collision: circle-vs-tile, avatar radius `0.35 m`, resolved per axis so the avatar slides along walls instead of sticking. **[Assumption]**
- **No pathfinding is required.** The return route is the judge's own recorded trail played in reverse. A* is not in scope.

### 5.5 Landmarks and decoration

Signs ("FOOD COURT", "LIFTS", "B3 PARKING"), planters, benches, an atrium fountain, parked cars in B3, and subtle animated details (a rotating cinema sign, drifting atrium light). **[Assumption]** Optional NPCs: 8–12 wandering pedestrians on fixed loops with no collision — purely for life, and the first thing cut if scope tightens (§16).

---

## 6. Phone UI concept and states

### 6.1 The device

A **simulated phone drawn in HTML/CSS/canvas** — not an emulator, not a screen mirror, no Android toolchain involved.

- Current-generation Android proportions, portrait: `372 × 786` CSS px, height-driven with a fixed aspect ratio so a short viewport shortens the handset rather than squashing it. **[Assumption]**
- Flat display, uniform hairline bezel, machined aluminium rail, volume rocker and power key proud of the right edge, centred hole-punch camera.
- The screen runs a Material 3 dark app: Android status bar (clock left, signal / Wi-Fi / battery right), a floating top app bar, and the gesture navigation pill. The status bar and pill sit above every app surface, because the OS draws them.
- Docked right on desktop.

### 6.2 Screen layout

Structured the way a real Android navigation app is: a full-bleed map with the
system bars drawn over it, a floating top bar, and a bottom sheet that owns all
the content.

```
+---------------------------+
| 9:41              signal  |  status bar, transparent over the map
|                 wifi batt |
|  +---------------------+  |
|  | (o) Lodestone  |  |  floating top app bar (M3 surface-container-high)
|  |                 SIM |  |
|  +---------------------+  |
|  [B3 Parking]  [o Remem.] |  chips over the map
|                           |
|      FULL-BLEED           |  the exploded-floors memory map
|      MEMORY MAP           |
|                           |
|  [.ııl High]              |  confidence chip, parked above the sheet
| .-----------------------. |
| |          --           | |  bottom sheet, 28dp top corners, drag handle
| | (i) Continue 24 m     | |  instruction: tonal icon + M3 title
| |     18 m to your car  | |
| | +-------+------+----+ | |
| | | 182 m | 241  |  4 | | |  stat row (tabular numerals + SIM markers)
| | +-------+------+----+ | |
| | (   Find my car     ) | |  M3 filled button, fully rounded
| '-----------------------' |
|          -----            |  gesture navigation pill
+---------------------------+
```

Material 3 dark tokens drive the whole surface: `surface`, `surface-container`,
`surface-container-high`, `on-surface`, `on-surface-variant`, `primary` /
`on-primary` / `primary-container`, plus `tertiary` for the SIM marker and
`error` for the off-route state. Type is the Roboto stack on the Material
scale, with tabular numerals wherever a figure ticks.

### 6.3 The isometric map inside the phone

Looks 3D, is not. Techniques:

- Same 2:1 isometric projection as the world, drawn to a small canvas at ~0.18× world scale.
- A simplified floor plate per level — corridor spines and block masses only, no storefront detail.
- **Faked depth:** when the route crosses floors, draw the non-active floor plates as translucent parallelograms offset vertically by 24 px, with a connecting vertical line at the elevator — an "exploded floors" look that reads instantly as 3D at zero rendering cost.
- The trail draws as a tapered polyline; the active route as a brighter ribbon with directional chevrons animating along it.
- The car marker is a pinned warm dot with a soft halo; the player is an accent dot with a heading cone.

### 6.4 States

Thirteen states. Each: purpose → trigger → mall shows → phone shows → exit.

**1. Landing / Start Demo**
Purpose: set context in five seconds. Trigger: page load. Mall: blurred, dimmed world behind an overlay. Phone: dark/off. Exit: **Start Demo** → Parked.

**2. Parked / Ready**
Purpose: establish the car and the zero-effort promise. Trigger: demo start. Mall: camera on the parked car, avatar beside it, B3. Phone: wakes; "Car parked on B3."; hint *"Just walk. Your phone is already remembering."* Exit: first movement input → Remembering.

**3. Remembering Your Walk**
Purpose: show recording happening with no user action. Trigger: first movement. Mall: trail begins. Phone: pulsing "Remembering your walk" pill; live stat strip; map trail grows. Exit: continues until Find My Car; overlaid by Floor Transition and Memory Created.

**4. Exploration**
Purpose: free play — the proof it is not a click-through. Trigger: same as above; this is the steady state. Mall: full freedom. Phone: as Remembering. Exit: Find My Car.

**5. Floor Transition**
Purpose: show multi-floor memory. Trigger: **E** / Use on a transition pad. Mall: 1.5 s fade + floor ticker. Phone: floor chip animates; a floor-event card slides in — "Elevator · B3 → L1". Exit: auto after animation → Remembering.

**6. Memory Created**
Purpose: the "aha" — the phone understood the walk. Trigger: first time `total_distance_m ≥ MEMORY_MIN_DIST` **and** ≥ 1 floor event; fires once. Mall: unchanged. Phone: a card with a **natural-language summary generated from the simulated facts**:

> *"Parked on B3. You walked about 180 m and took the elevator up to L2. Roughly a 4 minute walk back."*

Exit: auto-dismiss after 5 s, or tap → Remembering.

**7. Find My Car**
Purpose: hand over to return mode. Trigger: **F** / button. Mall: unchanged. Phone: 800–1000 ms morph; map zooms to fit the whole route. Exit: auto → Route Overview.

**8. Route Overview**
Purpose: show the whole remembered journey at once — the screenshot moment. Trigger: end of the morph. Mall: the full route ribbon appears in the world too. Phone: exploded-floors map, full route, summary line, **Start Guidance** button. Exit: Start Guidance (or auto after 4 s) → Return Navigation.

**9. Return Navigation**
Purpose: guide, honestly. Trigger: guidance start. Mall: bright route ribbon with chevrons pointing back to the car. Phone: one instruction at a time, distance remaining, confidence chip **High**. Exit: off-route → Off Route; arrival → Car Found.

**10. Off Route**
Purpose: demonstrate confidence-aware honesty. Trigger: distance-to-route > `OFF_ROUTE_DIST` for `OFF_ROUTE_HOLD` (§7.10). Mall: route ribbon dims. Phone: warn colour, icon change, confidence **Low**, text *"You've stepped away from the remembered route. Showing the full route instead."* — and it **stops giving turn instructions**, showing the stored route in full instead. Exit: recovery.

**11. Route Recovered**
Purpose: close the loop and restore trust. Trigger: distance-to-route < `RECOVER_DIST` for `RECOVER_HOLD`. Mall: ribbon brightens. Phone: brief green "Back on your route" toast; confidence returns to High; guidance resumes from the nearest route node ahead of the player. Exit: auto after 1.5 s → Return Navigation.

**12. Car Found**
Purpose: the climax. Trigger: within `ARRIVE_DIST` of the car, on the car's floor. Mall: spotlight on the car, particle burst, camera push-in. Phone: success card — total distance, walk duration, floors crossed, return time — plus *"Your route was remembered from motion alone. No GPS. No beacons. No camera."* Exit: **Replay**.

**13. Restart**
Purpose: repeatable takes. Trigger: **R** or Replay. Mall/phone: 300 ms fade to Landing with all state cleared, no page reload. Exit: → Landing.

### 6.5 Mobile-viewport fallback

Below `768 px` width the layout inverts: **the phone UI becomes the primary surface**, filling the viewport chrome-free (the device frame is dropped — you are already on a phone), and the mall world collapses to a panel occupying ~38 % of screen height at the top, with the same camera follow. Touch controls overlay the world panel. A "swap view" toggle lets the judge make either surface full-bleed.

This satisfies the phone-first requirement using the same code path and the same state tree — nothing is forked.

---

## 7. Simulation/gameplay logic

> **Everything in this section is simulation.** The engine knows the player's exact position at all times. Distance, steps, turns, floor events, and confidence are *derived from that known position*, not measured. §17.12 maps each to the real mechanism it stands in for.

### 7.1 Units and loop

- World unit = 1 metre. Grid tile = 1 m.
- Fixed-timestep simulation at 60 Hz; rendering decoupled via `requestAnimationFrame`; `dt` clamped to 50 ms to survive tab switches.

### 7.2 Movement

| Constant | Value | Note |
|---|---|---|
| `WALK_SPEED` | `1.8 m/s` | A brisk walk: above a real pace of ~1.4, well below a jog **[Assumption]** |
| `SLOW_SPEED` | `0.8 m/s` | Shift held |
| `ACCEL` | `18 m/s²` | Snappy but not instant |
| `PLAYER_RADIUS` | `0.35 m` | Collision circle |

Input is normalised so diagonal movement is not faster.

### 7.3 Trail recording and sampling

- Append a sample when the player has moved `TRAIL_SAMPLE_DIST = 1.5 m` from the last sample **or** `TRAIL_SAMPLE_TIME = 400 ms` has elapsed while moving — whichever fires first.
- Sample shape: `{ t, x, y, floor, heading }`.
- Cap at `MAX_SAMPLES = 4000`; beyond that, decimate by dropping alternate samples from the middle (never the endpoints).
- Stationary time records nothing — this alone keeps the memory clean.

### 7.4 Derived distance

`total_distance_m += hypot(dx, dy)` per frame while moving. Floor transitions add a fixed `FLOOR_TRANSITION_DIST = 6 m` **[Assumption]** so the elevator does not read as teleportation.

### 7.5 Derived steps

`steps_sim = round(total_distance_m / STRIDE_M)`, `STRIDE_M = 0.72`. **[Assumption]** In the real product, stride is estimated per-user from accelerometer cadence; here it is a constant, and the UI marks the figure `SIM`.

### 7.6 Derived turns

Track smoothed heading (EMA, `α = 0.25`). When accumulated heading change exceeds `TURN_THRESHOLD = 55°` within `TURN_WINDOW = 1.2 s`, emit `{ t, type: LEFT_TURN | RIGHT_TURN, angle }` and reset the accumulator. Enforce `TURN_COOLDOWN = 1.0 s` so a gentle curve does not spray events.

### 7.7 Floor transitions

- Standing on a transition pad sets `canUseTransition = true` and shows the prompt.
- On use: freeze input, run the 1.5 s animation, set `floor` to the target, place the avatar on the destination pad, append `floor_event { t, type, from, to }`, and insert a trail sample on **each** floor at the pad so the route is continuous across levels.
- The three-floor elevator uses a small inline floor picker; stairs and escalator are single-hop.

### 7.8 Route memory creation

The route object is built **continuously**, not at a "save" moment — that is the zero-effort principle. `Memory Created` is a *presentation* event, not a data event; it fires once when `total_distance_m ≥ MEMORY_MIN_DIST (40 m)` **and** `floor_events.length ≥ 1`.

The natural-language summary is templated from the recorded facts:

```
"Parked on {startFloorLabel}. You walked about {roundTo10(dist)} m
 and took the {lastTransitionType} {up|down} to {currentFloorLabel}.
 Roughly a {ceil(dist / WALK_BACK_SPEED / 60)} minute walk back."
```

with `WALK_BACK_SPEED = 1.2 m/s` (human walking pace, not game pace). If there is no floor event yet, the middle clause is dropped. No slot numbers, no venue names — nothing the system could not know.

### 7.9 Route reversal and path following

- The return route is `path.slice().reverse()` — the judge's own trail. There is no pathfinding anywhere in the prototype, and `sim/trail.ts` deliberately has no access to the map grid, so it *cannot* compute a way around obstacles even by accident.
- **Two representations, one walk.** RDP (`ε = 1.2 m`) produces a ~15-node *guidance skeleton* used for instruction wording, node advance and off-route distance. The *drawn ribbon* is the raw reversed trail.
- This split is load-bearing. Drawing the ribbon from the skeleton visibly cuts the corners the judge walked around — measured on a real walk, the skeleton collapsed a 163-segment trail into 13 segments with a single 56 m chord — which reads as a generated shortcut rather than a replay of their own route. The skeleton stays for wording only; the line the judge follows is the line they walked.
- Maintain `targetNodeIndex`. Advance it when the player is within `NODE_REACH = 3.0 m` of that node **and** on its floor.
- Instruction generation from the simplified route:
  - Distance to next node > 15 m → "Continue {d} m"
  - Turn angle at next node > 40° → "Turn {left|right} ahead"
  - Next node is a floor event → "Take the {elevator|stairs} {down|up} to {floor}"
  - Final node → "Your car is just ahead"

### 7.10 Off-route detection and recovery

| Constant | Value | Meaning |
|---|---|---|
| `OFF_ROUTE_DIST` | `8 m` | Perpendicular distance to the nearest route segment |
| `OFF_ROUTE_HOLD` | `1.2 s` | Must persist, so brushing past a planter does not trip it |
| `RECOVER_DIST` | `4 m` | Hysteresis gap prevents flapping at the boundary |
| `RECOVER_HOLD` | `0.6 s` | Recovery should feel instant |
| Wrong floor | immediate | Being on a floor the route does not contain is off-route with no hold |

Distance is point-to-segment against the *simplified* route, considering only segments on the player's current floor.

On recovery, snap `targetNodeIndex` to the nearest node **ahead** of the projection point, so guidance never tells the judge to walk backwards.

### 7.11 Confidence model

Simulated, and labelled as such. A single scalar from distance-to-route:

```
conf      = clamp(1 - (distToRoute / OFF_ROUTE_DIST), 0, 1)
displayed = smooth(conf, alpha = 0.15)      // avoid a twitchy chip

High   : displayed >= 0.70
Medium : 0.35 <= displayed < 0.70
Low    : displayed <  0.35   -> Off Route presentation
```

In Route Overview (before guidance starts) confidence displays **High** by definition.

### 7.12 Arrival detection

`ARRIVE_DIST = 3.5 m` from the car **and** `floor === carFloor`. Fires once; further movement does not re-trigger. A 400 ms hold prevents flicker if the judge skims the boundary.

### 7.13 Constants summary (copy-paste for the developer)

```js
export const SIM = {
  WALK_SPEED: 1.8, SLOW_SPEED: 0.8, ACCEL: 18, PLAYER_RADIUS: 0.35,
  TRAIL_SAMPLE_DIST: 1.5, TRAIL_SAMPLE_TIME: 400, MAX_SAMPLES: 4000,
  STRIDE_M: 0.72, FLOOR_TRANSITION_DIST: 6,
  TURN_THRESHOLD_DEG: 55, TURN_WINDOW_MS: 1200, TURN_COOLDOWN_MS: 1000,
  MEMORY_MIN_DIST: 40, RDP_EPSILON: 1.2, NODE_REACH: 3.0,
  OFF_ROUTE_DIST: 8, OFF_ROUTE_HOLD_MS: 1200,
  RECOVER_DIST: 4, RECOVER_HOLD_MS: 600,
  ARRIVE_DIST: 3.5, ARRIVE_HOLD_MS: 400,
  WALK_BACK_SPEED: 1.2,
  CAMERA_LERP: 0.12, ZOOM_MIN: 0.6, ZOOM_MAX: 1.6,
  HEADING_EMA: 0.25, CONFIDENCE_EMA: 0.15,
}
```

---

## 8. Shared state/data model

### 8.1 One state tree, one owner

A single store owns everything. The mall view and the phone view are **both pure readers** — neither mutates. This is what guarantees they can never disagree, which is the single most important correctness property of the demo.

```ts
type Floor = -3 | 1 | 2   // B3, L1, L2

interface SimState {
  phase: 'landing' | 'parked' | 'remembering' | 'floorTransition'
       | 'memoryCreated' | 'findMyCar' | 'routeOverview'
       | 'returnNav' | 'offRoute' | 'recovered' | 'carFound'

  player: { x: number; y: number; floor: Floor; heading: number; speed: number }
  car:    { x: number; y: number; floor: Floor }
  camera: { x: number; y: number; zoom: number }

  memory: {
    path: Array<{ t: number; x: number; y: number; heading: number; floor: Floor }>
    simplified: Array<{ x: number; y: number; floor: Floor; nodeType?: 'turn' | 'transition' }>
    turn_events:  Array<{ t: number; type: 'LEFT_TURN' | 'RIGHT_TURN'; angle: number }>
    floor_events: Array<{ t: number; type: 'ELEVATOR' | 'STAIRS' | 'ESCALATOR'; from: Floor; to: Floor }>
    magnetic_series_sim: Array<{ t: number; magnitude_uT: number }>   // cosmetic only
    total_distance_m: number
    steps_sim: number
    walk_duration_s: number
    created: boolean
  }

  nav: {
    active: boolean
    targetNodeIndex: number
    distanceRemaining_m: number
    instruction: string
    confidence: number            // 0..1, simulated
    offRouteSince: number | null
    onRouteSince: number | null
  }

  ui: { reducedMotion: boolean; mobileLayout: boolean; toast: string | null }
}
```

### 8.2 Update loop

```
input -> applyMovement(dt) -> collide -> sampleTrail -> deriveMetrics
      -> updateFloorState -> updateNav -> updateConfidence -> updatePhase
      -> render(mall) || render(phone)
```

One tick, one state commit, both views render from the committed state. **No view-local simulation state exists anywhere.** If the phone ever shows something the world does not, that rule has been broken.

### 8.3 The route object — prototype vs real

The prototype route mirrors the real product's shape so the PPT and the demo tell one story.

| Real field | Prototype counterpart | Note |
|---|---|---|
| `route_id`, `created_at` | present | generated locally |
| `venue_hint` | `"Demo Mall (simulated)"` | fixed string, honestly labelled |
| `entrance_fix` | **absent** | no GPS exists in the prototype; omitted rather than faked |
| `path[]` | `memory.path[]` | same shape; `x/y` are game metres, not PDR output |
| `magnetic_series[]` | `magnetic_series_sim[]` | **synthesised** from seeded noise, purely for the trace visual |
| `floor_events[]` | `floor_events[]` | scripted from pad use; no per-event confidence is faked |
| `turn_events[]` | `turn_events[]` | derived from heading change; again no fabricated confidence |
| `confidence.pdr` / `.magnetic` | **absent** | the prototype has one heuristic `nav.confidence`, not two sensor scores |
| `total_distance_m` | present | exact by construction |
| `walk_duration_s` | present | exact by construction |

**Real fields with no prototype counterpart:** `entrance_fix`, per-event sensor confidences, and the split `confidence.pdr` / `confidence.magnetic`. These belong to the real system and are described in §17.

### 8.4 Serialization for replay

`exportRun()` serialises `{ memory, car, seed }` to JSON; `loadRun(json)` restores it and jumps straight to Route Overview. Purpose: if a live walk goes wrong during recording, the team can reload a known-good run and shoot the return-navigation half cleanly. Kept in memory and optionally `localStorage`; never sent anywhere.

---

## 9. Recommended web stack

**Recommendation: React + Vite + TypeScript, with Zustand for the state tree, a single `<canvas>` (2D context) for the mall world, a second small `<canvas>` for the phone map, and the rest of the phone UI in plain React + CSS — shipped as a static PWA.**

Why this, and not the alternatives:

- **Canvas 2D, not WebGL/Three.js** — the world is isometric sprites and tiles, comfortably inside Canvas 2D's budget once culled, and it removes an entire class of shader and device-compatibility risk on the iQOO browser. It also enforces the "never fully 3D" constraint structurally.
- **React for the phone, canvas for the world** — the phone is UI (state-driven text, cards, transitions) where React is fastest to build; the world is a render loop where React would only get in the way. Splitting along that line is why this is quick.
- **Zustand, not Redux or Context** — one store, sub-millisecond reads inside a 60 Hz loop, and selector subscriptions so a phone text change does not re-render the world.
- **Vite** — instant HMR, zero-config TS, static build output that drops onto any host.

Key libraries, deliberately few:

| Library | Purpose |
|---|---|
| `react`, `react-dom` | Phone UI and app shell |
| `zustand` | Shared state tree |
| `vite`, `typescript` | Build and types |
| `vite-plugin-pwa` | Manifest + service worker offline shell |
| `framer-motion` *(optional)* | Phone state transitions; CSS transitions are an acceptable substitute |

No game engine, no physics library, no router, no UI kit, no backend SDK.

---

## 10. Development/setup requirements

Minimal and honest — this is the complete list.

- **Node.js 20+** and npm
- A modern browser (Chrome / Edge / Firefox / Safari)
- A code editor
- A GitHub account (only for the hosting flow in §11)
- An iQOO phone on the same network for local testing, plus its browser

**Explicitly not required:** Android Studio, Android SDK, JDK, Gradle, Kotlin, ADB, device drivers, emulators, Docker, any database, or any cloud account beyond the static host. The simulated phone is drawn with web graphics; none of the Android toolchain is involved.

**Office Kit** may be used to mirror or present the laptop/phone during the live pitch. It is **optional and supporting** — the judge's public URL must work with no Office Kit involvement whatsoever.

```bash
npm create vite@latest lodestone -- --template react-ts
```

```bash
npm install zustand
```

```bash
npm install -D vite-plugin-pwa
```

```bash
npm run dev -- --host
```

---

## 11. Hosting/deployment plan

**Host:** Vercel — static output, free tier, custom subdomain, auto-deploy on push to `main`. Netlify or GitHub Pages are drop-in equivalents if Vercel is unavailable. **[Assumption]**

**Build:** `npm run build` → `dist/`. No environment variables, no serverless functions, no runtime backend.

**URL:** a short, memorable custom subdomain, e.g. `lodestone.vercel.app`. Print it as a QR code on the pitch slide so judges reach it in one scan.

**PWA**

- `manifest.webmanifest`: name "Lodestone", short name "Lodestone", `display: standalone`, portrait orientation, theme colour `#0B0F1A`, 192 / 512 px icons including a maskable variant.
- Service worker via `vite-plugin-pwa` (`generateSW`): precache the full app shell — JS, CSS, tile atlas, fonts. After the first load the demo runs **fully offline**, which is the real insurance against venue Wi-Fi.
- Verify: load once, enable airplane mode, reload — the demo must still play end to end.

**iQOO browser verification** — do this on day one of hosting, not on demo morning:

1. Open the public URL in the iQOO's browser.
2. Confirm the mobile fallback layout (§6.5) engages and the phone surface is primary.
3. Confirm the touch joystick moves the avatar and Use / Find My Car / Restart all work.
4. Complete a full run: park → walk → floor change → Find My Car → off route → recover → Car Found.
5. Add to Home Screen, relaunch from the icon, confirm standalone display.
6. Airplane-mode reload test.
7. Judge frame rate subjectively; if it stutters, drop default zoom to `0.85×` and disable NPCs on mobile.

**Demo-day fallback ladder** — each step assumes the previous failed:

1. Public URL on the venue network.
2. Public URL on a phone hotspot.
3. The already-cached PWA offline, on the laptop and on the iQOO — this is why the offline shell is non-negotiable.
4. `npm run preview` from the laptop over `localhost`.
5. A pre-recorded 1080p capture of a clean full run, kept on both laptop and phone.

---

## 12. Project structure

As built. Where this differs from the structure originally planned, the reason is given in §12.1.

```
lodestone/
├── index.html                     App shell, meta, viewport
├── vite.config.ts                 Vite + PWA plugin config
├── tsconfig.json                  Strict TS config
├── package.json                   Deps and scripts
├── README.md                      Run instructions and controls
├── scripts/
│   └── make-icons.mjs             Generates the PWA PNG icons, no image deps
├── public/
│   ├── icons/icon-192.png         PWA icon
│   └── icons/icon-512.png         PWA icon (also used maskable)
├── docs/
│   └── LODESTONE_PROTOTYPE_PRD.md   This document
└── src/
    ├── main.tsx                   React entry, mounts App
    ├── App.tsx                    Layout: world panel + phone panel, responsive swap
    ├── sim/
    │   ├── constants.ts           The SIM constants block from §7.13
    │   ├── state.ts               The single mutable state tree (§8.1) - the one owner
    │   ├── store.ts               Throttled Zustand mirror of state for React
    │   ├── actions.ts             startDemo / restart / findMyCar / beginGuidance
    │   ├── loop.ts                Fixed-timestep tick, phase machine, arrival check
    │   ├── movement.ts            Input → velocity → per-axis collision resolution
    │   ├── trail.ts               Trail sampling, decimation, RDP, route construction
    │   ├── metrics.ts             Distance, steps, turns, duration derivation
    │   ├── floors.ts              Transition pads, floor-change sequencing
    │   ├── navigation.ts          Route reversal, node advance, instruction text
    │   ├── confidence.ts          Off-route / recovery / confidence heuristic
    │   ├── summary.ts             Natural-language memory summary templating
    │   ├── serialize.ts           exportRun / loadRun for replay
    │   └── verify.ts              Route walkability + continuity audits (test seam)
    ├── world/
    │   ├── maps/build.ts          Carving helpers, shared pad coordinates
    │   ├── maps/b3.ts             B3 parking grid, bays, columns, service dead end
    │   ├── maps/l1.ts             L1 concourse, food court, atrium, entrance hall
    │   ├── maps/l2.ts             L2 cinema, apparel court, balcony, skybridge
    │   ├── maps/index.ts          Map registry, walkability, collision, pad queries
    │   ├── tiles.ts               Tile vocabulary, walkability, heights, colours
    │   ├── iso.ts                 World↔screen isometric projection and shading
    │   ├── camera.ts              Follow, damping, dead-zone, zoom clamp
    │   ├── renderer.ts            Culled, depth-sorted canvas draw of the world
    │   └── MallView.tsx           Canvas host + its own animation frame
    ├── phone/
    │   ├── PhoneFrame.tsx         Android chassis: rail, keys, hole-punch
    │   ├── PhoneScreen.tsx        State router for the 13 UI states
    │   ├── StatusBar.tsx          Android status bar with real icon geometry
    │   ├── MemoryMap.tsx          Canvas: exploded-floors isometric memory map
    │   ├── StatStrip.tsx          Distance / steps / turns, with SIM markers
    │   ├── Instruction.tsx        Primary + secondary guidance lines
    │   ├── ConfidenceChip.tsx     High / Medium / Low - word + glyph + colour
    │   ├── states/Cards.tsx       Floor event, Memory Created, toast, morph
    │   └── states/Overlays.tsx    Route Overview sheet, Car Found overlay
    ├── ui/
    │   ├── Landing.tsx            Start Demo screen
    │   ├── input.ts               Keyboard bindings
    │   ├── WorldOverlays.tsx      Floor badge, zoom, use prompt, floor picker, veil
    │   ├── TouchControls.tsx      Joystick + context buttons (mobile)
    │   └── SimBadge.tsx           The "Simulation - no real sensors" marker
    └── styles/
        ├── tokens.css             Colour, type, spacing tokens from §4.6
        ├── global.css             Reset, app shell, world overlays, mobile layout
        └── phone.css              The simulated phone and its states
```

### 12.1 Where the build differs from the original plan

| Change | Why |
|---|---|
| No `public/atlas/tiles.png`; tiles are drawn procedurally as shaded isometric geometry | Removes the art pipeline entirely. No binary assets to author, a tiny bundle, and per-tile tinting comes free. Nothing about the look depends on it. |
| `sim/state.ts` (mutable) split from `sim/store.ts` (React mirror) | The plan implied one store. Running a 60 Hz simulation through React would re-render the world on every frame; the split is what keeps the render loop free. The one-owner rule is unchanged. |
| `phone/states/` is two files (`Cards.tsx`, `Overlays.tsx`) rather than one per state | Several states are a few lines each. Grouping them by shape keeps them readable. |
| Route Overview is a bottom **sheet**, not a full-screen overlay | A full overlay hid the exploded-floors map - the whole point of that state. The sheet keeps the map on screen. |
| `world/npc.ts` not implemented | It is the first item on the §16 cut list and was not needed. |
| `framer-motion` not installed | CSS transitions were sufficient, as §9 allowed. One less dependency. |
| `scripts/make-icons.mjs` added | Generates the PWA icons from code so no image tooling is needed to rebuild them. |
| The phone is a Material 3 dark app, not a bespoke panel layout | The original screen layout was a stack of custom rows. Rebuilt on Material 3 structure - system bars, floating top app bar, bottom sheet, filled/tonal buttons, tonal icon containers - so it reads as a real Android app rather than a styled web page. |
| The map is full-bleed with the chrome floating over it | Matches how every Android navigation app is laid out, and gives the exploded-floors map far more room than a boxed map area did. |
| The map measures the top bar and sheet rather than assuming insets | The sheet height is content-driven and the top bar sits lower on desktop than on a phone; measuring keeps the map centred in the band actually left free, and publishes `--sheet-h` so chips can park above the sheet. |
| `sim/loop.ts` exports `stepFrames()` | A test seam: it advances the simulation deterministically without `requestAnimationFrame`, which is how the §14 checks were run in a browser. The app itself always runs through `startLoop()`. |

## 13. Implementation phases

Time boxes assume one to two developers; total ≈ 5 working days. **[Assumption]**

| # | Phase | Work | Exit criterion | Box |
|---|---|---|---|---|
| 1 | **Setup** | Vite + React + TS + Zustand scaffold, tokens, empty split layout | Blank app deploys to the public URL and loads on the iQOO | 2 h |
| 2 | **World** | Iso projection, tile atlas, three floor maps, culled layered renderer | All three floors render at ≥ 55 fps on the laptop, no seams | 8 h |
| 3 | **Player** | Movement, collision, camera follow, zoom, transition pads | Avatar walks all three floors, cannot clip walls, elevator changes floor | 6 h |
| 4 | **Route simulation** | Trail sampling, distance/steps/turns, floor events, RDP, memory object | A walk produces a correct route object; `exportRun()` round-trips | 6 h |
| 5 | **Phone UI** | Frame, screen shell, memory map canvas, stat strip, states 1–6 | Phone mirrors a live walk exactly; no view-local state anywhere | 10 h |
| 6 | **Navigation** | Reversal, node advance, instructions, off-route, recovery, arrival, states 7–13 | Full return loop works including a deliberate wrong turn and recovery | 8 h |
| 7 | **Synchronization** | Verify one-store discipline; world route ribbon; reduced-motion pass | No tested scenario makes world and phone disagree | 3 h |
| 8 | **Polish** | Motion, transitions, spotlight, particles, signage, optional NPCs | Passes the 640 px downscale readability check (§4.5) | 8 h |
| 9 | **Deployment** | PWA manifest, service worker, custom URL, QR code | Offline reload works on laptop and iQOO | 3 h |
| 10 | **Testing** | Run §14 end to end on desktop and the iQOO; fix what fails | Every §14 box ticks | 4 h |
| 11 | **Demo rehearsal** | Shoot the §15 flow three times; tune constants for camera legibility | Three consecutive clean takes, no mid-take resets | 3 h |

Phases 5 and 6 make or break the demo. If the schedule slips, cut from phase 8 and §16 — never from 5 or 6.

---

## 14. Testing and acceptance criteria

A person with a browser can run this in ten minutes. Every item is pass/fail.

**Cold start**

- [ ] Public URL loads in a fresh/incognito profile with no login, permission, or install prompt.
- [ ] Landing shows the tagline, Start Demo, the controls legend, and the simulation badge.
- [ ] Start Demo enters B3 with car and avatar visible within 2 s.

**Movement and world**

- [ ] WASD and arrows both move the avatar; diagonals are not faster.
- [ ] The avatar cannot pass through walls, storefronts, or parked cars.
- [ ] Camera follows smoothly with no jitter when tapping a direction key.
- [ ] Zoom stays within clamps and never reveals world-edge void mid-screen at 1×.
- [ ] All three floors are reachable and fully walkable.

**Recording**

- [ ] The trail begins on the first movement, with no user action.
- [ ] Distance, steps, and turns increase while walking and freeze while standing still.
- [ ] Every visible derived figure carries a SIM marker.
- [ ] Walking a corridor and turning one corner produces exactly one turn event, not several.

**Floors**

- [ ] Standing on the elevator pad shows the prompt; **E** triggers the transition.
- [ ] Floor chip and world both update; a floor-event card appears on the phone.
- [ ] The trail is continuous across the floor change — no gap at the elevator.
- [ ] Stairs and escalator both work L1 ↔ L2.

**Memory**

- [ ] Memory Created fires once, after ≥ 40 m and ≥ 1 floor event.
- [ ] The natural-language summary matches the actual walk: distance ± 10 m, correct floors, correct transition type.
- [ ] The summary contains no slot number, venue name, or any invented ground truth.

**Return navigation**

- [ ] **F** morphs the phone and zooms the map to fit the full route.
- [ ] The route ribbon appears in both the world and the phone, pointing back to the car.
- [ ] A different exploration path produces a visibly different route — confirming it is not a preset.
- [ ] Walking into the B3 service dead end and back out puts that detour in the drawn route, rather than bypassing it.
- [ ] Every drawn route segment sampled at 0.2 m lands on a walkable tile (`auditDrawnRibbon()` in `sim/verify.ts` reports zero faults).
- [ ] Instructions update as nodes are reached and never tell you to walk backwards.

**Off route and recovery**

- [ ] Walking > 8 m off route for > 1.2 s triggers Off Route within ~2 s.
- [ ] Off Route stops giving turn instructions and shows the full stored route instead.
- [ ] The confidence chip reads Low with a word and icon change, not colour alone.
- [ ] Returning within 4 m recovers within ~2 s and resumes from a node ahead.
- [ ] Standing exactly at the 8 m boundary does not flicker between states.
- [ ] Going to a floor the route does not include triggers Off Route immediately.

**Arrival and restart**

- [ ] Reaching the car on B3 triggers Car Found once, with the run summary.
- [ ] **R** and the Replay button both reset to Landing in < 1 s with no page reload.
- [ ] A second run records fresh — no leftover trail, stats, or route from the first.

**Accessibility and motion**

- [ ] Every control is reachable and operable by keyboard, with a visible focus ring.
- [ ] `prefers-reduced-motion` collapses transitions; the demo remains completable.
- [ ] Phone state changes are announced via `aria-live`.
- [ ] Screenshot downscaled to 640 px wide: the phone instruction line is still readable.

**iQOO browser smoke test**

- [ ] The public URL loads in the iQOO's browser.
- [ ] Mobile layout engages: phone surface primary, world panel above.
- [ ] Joystick and the Use / Find My Car / Restart buttons all work by touch.
- [ ] A full run completes on the phone: park → walk → floor → find → off route → recover → found.
- [ ] Add to Home Screen, relaunch standalone, airplane-mode reload — still playable.
- [ ] No console errors during a full run.

---

## 15. Demo/replay plan

**Target length: 3–5 minutes**, shot in one continuous take where possible.

| Time | Beat | On screen | Said |
|---|---|---|---|
| 0:00–0:20 | **The problem** | Landing screen | "You park in a mall basement. Two hours later, GPS is dead and so is your pin." |
| 0:20–0:40 | **Park** | Start Demo → B3, car, phone wakes | "Here's the car on B3. Watch what the phone does — the answer is nothing. No button." |
| 0:40–1:40 | **Walk + memory builds** | Walk the B3 lot to the lift lobby; trail grows; stats climb | "It's already remembering the walk. Distance, turns, floors — all from motion." |
| 1:40–2:05 | **Floor change** | Elevator B3 → L1 → L2; floor-event card | "It logs the elevator as a floor event, so the memory is three-dimensional." |
| 2:05–2:30 | **Explore + Memory Created** | Wander L2; summary card appears | *"Parked on B3. You walked about 180 m and took the elevator up to L2. Roughly a 4 minute walk back."* |
| 2:30–2:50 | **Find My Car** | Press F; phone morphs; exploded-floors route overview | "Two hours later, one tap." |
| 2:50–3:30 | **Return** | Follow the ribbon down through L1 to B3 | "Turn by turn, back along the walk it remembered." |
| 3:30–3:55 | **Wrong turn → honesty** | Walk into the B3 service corridor; Off Route; confidence drops | "And when it isn't sure, it says so. It shows you the whole route instead of guessing." |
| 3:55–4:15 | **Recovery** | Walk back; Route Recovered; guidance resumes | "Step back on and it picks up exactly where you are." |
| 4:15–4:40 | **Car Found** | Spotlight, summary card | "No GPS. No beacons. No venue app. No camera. Just the walk." |
| 4:40–5:00 | **The real thing** | Cut to the PPT architecture slide | "In the product, that trail is PDR plus a magnetic fingerprint matched with DTW. This is the experience it produces." |

**Reset/replay mechanism**

- **R** resets to Landing in < 1 s with no page reload — safe to press mid-take.
- `loadRun(json)` restores a known-good recorded walk and jumps to Route Overview, so the second half can be reshot without rewalking the first.
- Because the app is an offline-capable PWA, takes can be shot with the network off — no loading spinner will ever ruin a take.

**Honesty in the demo script.** The presenter says "simulated" or "in the prototype" at least once during the walk section, and the simulation badge stays visible throughout. Never imply the browser is reading sensors.

---

## 16. Risks and scope-control decisions

| Risk | Impact | Mitigation |
|---|---|---|
| World-building eats the schedule | Phone UI and navigation — the actual story — arrive half-built | Maps are data arrays, not hand-placed art. Timebox phase 2 hard at 8 h; shrink floors before shrinking phases 5/6 |
| Off-route logic flickers at the boundary | Judge sees a twitchy, broken-looking state | Hysteresis (8 m out / 4 m in) plus hold timers, specified in §7.10 and tested explicitly in §14 |
| Route from the raw trail is too noisy to guide with | Instructions become nonsense, chevrons unreadable | RDP simplification at ε = 1.2 m before any guidance or display |
| Phone unreadable in the recorded video | The core surface does not land | The 640 px downscale check in §4.5 is a phase 8 exit gate |
| iQOO browser performance | The phone-first requirement fails on the day | Canvas 2D not WebGL; culling; NPCs off on mobile; verify on day one of hosting, not demo morning |
| Venue network fails | No demo | Offline PWA shell + the five-step fallback ladder in §11 |
| Scope creep into real sensors | Weeks of work, no demo | §2.2 is binding. Real sensing is PPT material only |

**Cut order if time runs short.** Cut strictly in this order, top first:

1. Ambient NPCs and animated decorations
2. Escalator (keep the elevator and stairs)
3. Particle burst and spotlight on Car Found (keep the card)
4. Framer Motion (fall back to CSS transitions)
5. The cosmetic magnetic trace visual
6. L2 shopping floor — collapse to B3 + L1 (still a floor transition, still a valid story)
7. Zoom control (lock to 1.0×)
8. `exportRun` / `loadRun` replay (keep the **R** reset)

**Never cut:** the phone UI, the route memory, Find My Car, off-route + recovery, Car Found, the simulation labelling, or the offline PWA shell. Those seven are the demo.

---

## 17. Future real-sensor architecture

**None of this runs in the prototype.** This section exists so the PPT and the demo tell one continuous story — and so nobody on the team is tempted to half-implement it.

### 17.1 The core insight

*A lodestone is naturally magnetised rock — the original compass. The product is named for the
inversion of it: the field is useless for pointing north here, and precisely because of that, useful
for saying where you are.*

In a parking garage the magnetometer is a **terrible compass and an excellent fingerprint**. Rebar, steel beams, and parked cars distort the local field badly enough to destroy compass headings — but that distortion is *spatially stable*: the same spot reads the same way an hour later. So Lodestone does two opposite things at once:

- **Excludes** the magnetometer from heading entirely — heading comes from `TYPE_GAME_ROTATION_VECTOR` (gyro + accelerometer, no magnetic reference), giving **relative** turns measured from the car.
- **Uses** the magnetometer as a **1D location fingerprint** along the walked path, aligned on return with Dynamic Time Warping.

### 17.2 Sensors

- **Accelerometer** — step detection via peak / zero-crossing on the vertical component; cadence for stride estimation; motion-state classification (still / walking / in-vehicle / vertical transit).
- **Gyroscope / `TYPE_GAME_ROTATION_VECTOR`** — relative heading. The game rotation vector deliberately omits the magnetic reference, so garage distortion cannot corrupt it. Drift is bounded over a 2–4 minute walk and further corrected by grid snapping.
- **Magnetometer** — never for heading. Recorded as field magnitude over time to form the route's magnetic signature.
- **Barometer (where available)** — supporting evidence for floor changes.

### 17.3 PDR (pedestrian dead reckoning)

Position is integrated step by step: each detected step advances the estimate by the current stride length along the current relative heading — `x += stride·cos(θ)`, `y += stride·sin(θ)`. No absolute reference is needed, because the origin is the car itself.

### 17.4 Stride estimation

Stride is not constant. It is estimated per-step from step frequency and vertical acceleration variance (a Weinberg-style estimator), calibrated per-user over time from walks where GPS is available outdoors. This replaces the prototype's fixed `STRIDE_M = 0.72`.

### 17.5 Relative heading and Manhattan/grid snapping

Parking structures are overwhelmingly rectilinear. Accumulated heading is snapped toward the dominant axis grid inferred from the first 30–60 s of walking, which cancels most gyro drift without needing a compass. Turns cluster near 90°; snapping makes that prior explicit.

### 17.6 Magnetic fingerprinting

Alongside the PDR path, the phone records magnetic field magnitude as a 1D series indexed by distance walked. This is the route's signature — not a map of the garage, just a trace of this one walk through it.

### 17.7 DTW alignment and drift correction

On return, the phone records a short live magnetic sequence as the user starts walking. **Dynamic Time Warping** aligns that live sequence against the stored series, tolerating the fact that the user walks at a different speed than before. The alignment yields *where along the stored route the user currently is* — which both localizes the user and corrects accumulated PDR drift by anchoring the estimate to a known point on the recorded path.

### 17.8 Floor detection as motion-event classification

Floor changes are not read from a floor sensor — they are **classified from motion**. An elevator produces a characteristic vertical acceleration signature (acceleration, sustained still period, deceleration) with horizontal motion absent; stairs produce a rhythmic vertical pattern with continued stepping; escalators produce stillness with a vertical offset. Each classification carries a confidence score, and the barometer corroborates. This is what the prototype's scripted `E`-key transition stands in for.

### 17.9 Automatic trigger

The user never starts anything. Recording begins when the system observes a **vehicle → pedestrian activity transition**, corroborated by context: the car's Bluetooth audio profile disconnecting, GNSS signal degrading or dropping under a deck, and the accelerometer motion state changing from in-vehicle to walking. Together these form a reliable "you just parked and got out" signal.

### 17.10 Phone-in-pocket / carry-mode handling

The phone's orientation is arbitrary and changes mid-walk. Carry mode (pocket, hand, swinging, bag) is detected from the accelerometer signature, and the algorithm adapts: step-detection thresholds change per mode, and heading is derived in the *device-independent* frame from the rotation vector, so a phone rotating in a pocket does not corrupt the path. **No orientation requirement is ever placed on the user.**

### 17.11 Confidence-aware localization

The real system carries two separate confidence scores — `confidence.pdr` (from step-detection quality, accumulated drift, and elapsed time) and `confidence.magnetic` (from DTW alignment cost and match uniqueness). When both are high it gives precise turn-by-turn guidance. When either drops, it degrades gracefully: coarse direction, then "you're somewhere in this section", then simply displaying the full stored route. **It never presents a low-confidence guess as precise.** The prototype's single distance-to-route heuristic (§7.11) stands in for this two-score model.

### 17.12 Prototype ↔ real product mapping

| Concern | Prototype (simulated) | Real product (PPT) |
|---|---|---|
| Movement | Keyboard/touch-driven avatar | Step detection + per-user stride estimation |
| Heading | Exact, from the input vector | Relative gyro / game rotation vector; magnetometer excluded |
| Route recording | Sampled positions from game state | PDR path reconstruction with Manhattan/grid snapping |
| Localization | Known position, exact | Magnetic fingerprint + DTW alignment against the stored series |
| Floor transitions | Scripted elevator/stair pad triggers | Motion-event classification with confidence, barometer-corroborated |
| Recording trigger | First movement input | Vehicle→pedestrian transition + Bluetooth + GNSS context + motion state |
| Device orientation | Not applicable | Carry-mode detection; device-independent frame; phone stays in pocket |
| Confidence | Distance-to-route heuristic, one scalar | Separate `confidence.pdr` and `confidence.magnetic` scores |
| Navigation | Reverse path-follow along the recorded trail | Confidence-aware reverse guidance with DTW drift correction |
| Magnetic series | Synthesised noise, cosmetic only | Real magnetometer magnitude series along the walked path |

---

## Appendix — Assumptions register

Every judgement call made in this document, in one place. All are reversible.

| # | Assumption | Section |
|---|---|---|
| A1 | Three floors (B3 / L1 / L2); L3 cut as cost without narrative gain | §5.2 |
| A2 | 120 × 90 m grid per floor, 64 × 32 px iso tiles | §5.1 |
| A3 | Camera damping 0.12/frame, no rotation, zoom 0.6–1.6× | §4.2 |
| A4 | `WALK_SPEED = 1.8 m/s` - a brisk walk, tuned by feel | §7.2 |
| A5 | `STRIDE_M = 0.72` fixed (the real product estimates per-user) | §7.5 |
| A6 | `FLOOR_TRANSITION_DIST = 6 m` added per floor change | §7.4 |
| A7 | Off-route 8 m / recover 4 m with hold timers; final values tuned in rehearsal | §7.10 |
| A8 | Confidence is a single distance-derived scalar, not a sensor model | §7.11 |
| A9 | Colour tokens and Inter / system-UI typography | §4.6 |
| A10 | Handset rendered at 372 × 786 CSS px, height-driven with a fixed aspect ratio | §6.1 |
| A11 | Canvas 2D over WebGL, for compatibility and to enforce "not 3D" | §9 |
| A12 | Vercel as host; Netlify / GitHub Pages are equivalent substitutes | §11 |
| A13 | Bounce-based avatar animation acceptable in place of a walk cycle | §4.4 |
| A14 | Ambient NPCs optional, first to be cut | §5.5, §16 |
| A15 | Static chunk baking is an optimisation, not a day-one requirement | §5.1 |
| A16 | `entrance_fix` omitted rather than faked — no GPS exists in the prototype | §8.3 |
| A17 | ≈ 5 working days for one to two developers | §13 |
