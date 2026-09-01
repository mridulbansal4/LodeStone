# Lodestone — interactive prototype

**Your phone remembers the walk, not the pin.**

A lodestone is naturally magnetised rock — the original compass. The name is literal: in a parking
garage the magnetic field is far too distorted to point north, but that same distortion is stable
enough to identify *where you are*. Lodestone throws away the compass and keeps the fingerprint.

A playable web prototype: park in a multi-floor mall, walk away, and the phone
records the route with no action from you — then guides you back through the building.

Everything the phone displays here is **simulated**. Distance, steps, turns, floor events and
confidence are derived from a position the engine already knows. No sensors are read, and there is no
camera, GPS, beacon or network dependency. The real sensor architecture (PDR, magnetic fingerprinting,
DTW alignment, floor-event classification, auto-trigger) is described in
[docs/LODESTONE_PROTOTYPE_PRD.md](docs/LODESTONE_PROTOTYPE_PRD.md) §17 and belongs to the PPT,
not to this build.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. Production build:

```bash
npm run build
```

`dist/` is a static, offline-capable PWA — drop it on any static host. Regenerate the app icons with
`node scripts/make-icons.mjs`.

## Controls

| Key | Action |
|---|---|
| `W` `A` `S` `D` / arrows | Move |
| `Shift` | Walk slowly |
| `E` | Use lift / stairs / escalator (then `1`–`3` to pick a floor) |
| `F` | Find My Car |
| `G` | Start guidance |
| `R` | Restart |
| `+` `−` / wheel | Zoom |
| `Esc` | Controls overlay |

On a phone the layout inverts — the phone UI becomes the primary surface, the world sits above it, and
an on-screen joystick plus Use / Find My Car / Restart buttons replace the keyboard.

## The demo path

Park on **B3** → walk to the lifts → **E** to L1 → explore → up to **L2** → **F** for Find My Car →
Start guidance → follow the route back → take a deliberate wrong turn (the phone drops to *Low
confidence* and shows the whole stored route rather than guessing) → walk back on → **Car Found**.
`R` resets to the landing screen in under a second, with no page reload.

## How it is put together

```
src/sim/     the simulation - one mutable state object, 60 Hz fixed-step loop
src/world/   the isometric mall: tile grids, culled canvas renderer, camera
src/phone/   the simulated Android handset and its Material 3 app UI
src/ui/      landing, input, world overlays, touch controls
```

`src/sim/state.ts` holds the single source of truth. The world canvas and the phone map read it
directly inside their own animation frames; React only ever sees a throttled mirror of it
(`src/sim/store.ts`), so a stat ticking over never re-renders the world. That one-owner rule is what
guarantees the two surfaces cannot disagree.

Tiles are drawn procedurally as shaded isometric geometry — there is no sprite atlas and no art
pipeline. Canvas 2D throughout: nothing here is 3D, and the phone's "3D" map is an exploded-floors
trick, not a renderer.
