import { sim } from '../sim/state'
import { getMap, MAP_W, MAP_H } from './maps'
import { idx } from './maps/build'
import { T, HEIGHT, COLOR, isWalkable, tileTint } from './tiles'
import { HW, HH, LIFT, toScreenX, toScreenY, shade } from './iso'
import { drawVehicle, pickModel, pickPaint, pickFlip } from './vehicles'
import { drawAvatar } from './avatar'
import { walkersOn } from './npcs'
import { TILE_H } from '../sim/constants'

const ACCENT = '#4DE1C1'
const WARM = '#FFB454'
const WARN = '#FF6B6B'

export function render(ctx: CanvasRenderingContext2D, vw: number, vh: number) {
  const map = getMap(sim.player.floor)
  const z = sim.camera.zoom

  ctx.save()
  ctx.fillStyle = '#0B0F1A'
  ctx.fillRect(0, 0, vw, vh)

  ctx.translate(vw / 2, vh / 2)
  ctx.scale(z, z)
  ctx.translate(-sim.camera.x, -sim.camera.y)

  // Visible world bounds, from the screen corners, with a generous margin for
  // tall props whose tops poke into frame from below.
  const halfW = vw / 2 / z
  const halfH = vh / 2 / z
  const corners = [
    [sim.camera.x - halfW, sim.camera.y - halfH],
    [sim.camera.x + halfW, sim.camera.y - halfH],
    [sim.camera.x - halfW, sim.camera.y + halfH],
    [sim.camera.x + halfW, sim.camera.y + halfH],
  ]
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [sx, sy] of corners) {
    const wx = sx / (2 * HW) + sy / (2 * HH)
    const wy = sy / (2 * HH) - sx / (2 * HW)
    minX = Math.min(minX, wx)
    maxX = Math.max(maxX, wx)
    minY = Math.min(minY, wy)
    maxY = Math.max(maxY, wy)
  }
  const x0 = Math.max(0, Math.floor(minX) - 3)
  const x1 = Math.min(MAP_W - 1, Math.ceil(maxX) + 3)
  const y0 = Math.max(0, Math.floor(minY) - 3)
  const y1 = Math.min(MAP_H - 1, Math.ceil(maxY) + 6)

  drawFloorLayer(ctx, map.grid, x0, x1, y0, y1)
  drawPads(ctx)
  drawTrail(ctx)
  drawRoute(ctx)
  drawPropLayer(ctx, map.grid, x0, x1, y0, y1)
  drawLabels(ctx)

  ctx.restore()
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, dy: number) {
  const tx = toScreenX(x, y)
  const ty = toScreenY(x, y) - dy
  ctx.beginPath()
  ctx.moveTo(tx, ty)
  ctx.lineTo(tx + HW, ty + HH)
  ctx.lineTo(tx, ty + TILE_H)
  ctx.lineTo(tx - HW, ty + HH)
  ctx.closePath()
}

function drawFloorLayer(
  ctx: CanvasRenderingContext2D,
  g: Uint8Array,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const t = g[idx(x, y)]
      if (t === T.VOID) continue
      const base = COLOR[t] ?? '#1E2740'
      // Props sit on a floor plate; walls get their own footprint colour.
      const floorColor = HEIGHT[t] ? shade(base, -0.35) : shade(base, tileTint(x, y))
      ctx.fillStyle = floorColor
      diamond(ctx, x, y, 0)
      ctx.fill()
    }
  }
}

function drawPads(ctx: CanvasRenderingContext2D) {
  const map = getMap(sim.player.floor)
  const pulse = 0.5 + 0.5 * Math.sin(sim.time / 380)
  for (const p of map.pads) {
    ctx.save()
    ctx.globalAlpha = 0.25 + pulse * 0.3
    ctx.fillStyle = ACCENT
    for (let y = p.y; y < p.y + p.h; y++) {
      for (let x = p.x; x < p.x + p.w; x++) {
        diamond(ctx, x, y, 0)
        ctx.fill()
      }
    }
    ctx.restore()
  }
}

function pathOnFloor(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number; floor: number }[],
  reverse = false,
) {
  let started = false
  for (let k = 0; k < pts.length; k++) {
    const p = pts[reverse ? pts.length - 1 - k : k]
    if (p.floor !== sim.player.floor) {
      started = false
      continue
    }
    const sx = toScreenX(p.x, p.y)
    const sy = toScreenY(p.x, p.y) + HH
    if (!started) {
      ctx.moveTo(sx, sy)
      started = true
    } else {
      ctx.lineTo(sx, sy)
    }
  }
}

function drawTrail(ctx: CanvasRenderingContext2D) {
  const path = sim.memory.path
  if (path.length < 2) return
  ctx.save()
  ctx.lineWidth = 7
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.16
  ctx.strokeStyle = ACCENT
  ctx.beginPath()
  pathOnFloor(ctx, path)
  ctx.stroke()

  ctx.globalAlpha = 0.6
  ctx.lineWidth = 2.5
  ctx.beginPath()
  pathOnFloor(ctx, path)
  ctx.stroke()
  ctx.restore()
}

/**
 * The return route.
 *
 * Drawn along the RAW recorded trail played backwards - not along the
 * RDP-simplified node list. The simplified nodes exist only so guidance can
 * say "turn left ahead"; if the ribbon were drawn from them it would visibly
 * cut the corners the user actually walked around, which reads as a generated
 * shortcut rather than a replay of their own walk.
 *
 * memory.simplified is still what gates visibility: it is non-empty only once
 * Find My Car has built the route.
 */
function drawRoute(ctx: CanvasRenderingContext2D) {
  if (sim.memory.simplified.length < 2) return
  const pts = sim.memory.path
  if (pts.length < 2) return
  const off = sim.phase === 'offRoute'

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Glow
  ctx.globalAlpha = off ? 0.12 : 0.28
  ctx.lineWidth = 16
  ctx.strokeStyle = off ? WARN : ACCENT
  ctx.beginPath()
  pathOnFloor(ctx, pts, true)
  ctx.stroke()

  // Ribbon
  ctx.globalAlpha = off ? 0.4 : 1
  ctx.lineWidth = 6
  ctx.strokeStyle = off ? '#8390B4' : ACCENT
  ctx.beginPath()
  pathOnFloor(ctx, pts, true)
  ctx.stroke()

  if (!off) drawChevrons(ctx, pts)
  ctx.restore()
}

/**
 * Chevrons spaced by arc length along the raw trail rather than per segment,
 * so a dense stretch of samples does not turn into a solid line of arrows.
 */
function drawChevrons(ctx: CanvasRenderingContext2D, pts: { x: number; y: number; floor: number }[]) {
  const STEP = 46
  const phase = ((sim.time / 900) % 1) * STEP
  ctx.fillStyle = '#0B0F1A'

  let acc = phase
  let prev: { x: number; y: number } | null = null

  for (let k = 0; k < pts.length; k++) {
    const p = pts[pts.length - 1 - k]
    if (p.floor !== sim.player.floor) {
      prev = null
      continue
    }
    const cur = { x: toScreenX(p.x, p.y), y: toScreenY(p.x, p.y) + HH }
    if (!prev) {
      prev = cur
      continue
    }

    const dx = cur.x - prev.x
    const dy = cur.y - prev.y
    const len = Math.hypot(dx, dy)
    if (len > 0.001) {
      const ang = Math.atan2(dy, dx)
      while (acc + STEP <= len) {
        acc += STEP
        const f = acc / len
        ctx.save()
        ctx.translate(prev.x + dx * f, prev.y + dy * f)
        ctx.rotate(ang)
        ctx.beginPath()
        ctx.moveTo(-3, -4)
        ctx.lineTo(4, 0)
        ctx.lineTo(-3, 4)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      acc -= len
    }
    prev = cur
  }
}

function drawPropLayer(
  ctx: CanvasRenderingContext2D,
  g: Uint8Array,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  // Back-to-front along screen depth (x + y), so props, vehicles and the
  // avatar occlude each other correctly with no z-buffer.
  const dMin = x0 + y0
  const dMax = x1 + y1
  const playerD = sim.player.x + sim.player.y
  const carD = sim.car.x + sim.car.y
  const carVisible = sim.car.floor === sim.player.floor
  let playerDrawn = false
  let carDrawn = false

  // Parked cars are stored as blocks of PARKED_CAR tiles. Collect each block
  // once, so a bay renders as a single vehicle instead of a row of fused
  // boxes, and sort it by the depth of its centre.
  const lot = collectParkedCars(g, x0, x1, y0, y1)
  let lotIndex = 0

  // Ambient pedestrians, sorted into the same depth order. Decoration only:
  // they hold no state and nothing collides with them.
  const walkers = walkersOn(sim.player.floor, sim.time)
    .map((wk) => ({ ...wk, d: wk.x + wk.y }))
    .sort((a, b) => a.d - b.d)
  let walkerIndex = 0

  for (let d = dMin; d <= dMax; d++) {
    while (lotIndex < lot.length && lot[lotIndex].d < d) {
      const b = lot[lotIndex++]
      drawVehicle(ctx, b.cx, b.cy, {
        model: pickModel(b.x, b.y),
        paint: pickPaint(b.x, b.y),
        axis: b.axis,
        flip: pickFlip(b.x, b.y),
      })
    }
    while (walkerIndex < walkers.length && walkers[walkerIndex].d < d) {
      drawWalker(ctx, walkers[walkerIndex++])
    }
    if (carVisible && !carDrawn && carD < d) {
      drawCar(ctx)
      carDrawn = true
    }
    if (!playerDrawn && playerD < d) {
      drawPlayer(ctx)
      playerDrawn = true
    }
    const xs = Math.max(x0, d - y1)
    const xe = Math.min(x1, d - y0)
    for (let x = xs; x <= xe; x++) {
      const y = d - x
      const t = g[idx(x, y)]
      if (t === T.PARKED_CAR) continue // drawn as a whole vehicle above
      const h = HEIGHT[t]
      if (!h) continue
      drawBox(ctx, x, y, h, COLOR[t] ?? '#2A3454', t)
    }
  }
  while (lotIndex < lot.length) {
    const b = lot[lotIndex++]
    drawVehicle(ctx, b.cx, b.cy, {
      model: pickModel(b.x, b.y),
      paint: pickPaint(b.x, b.y),
      axis: b.axis,
      flip: pickFlip(b.x, b.y),
    })
  }
  while (walkerIndex < walkers.length) drawWalker(ctx, walkers[walkerIndex++])
  if (carVisible && !carDrawn) drawCar(ctx)
  if (!playerDrawn) drawPlayer(ctx)
}

function drawWalker(
  ctx: CanvasRenderingContext2D,
  wk: { x: number; y: number; heading: number; accent: string; bag: boolean },
) {
  drawAvatar(ctx, {
    x: toScreenX(wk.x, wk.y),
    y: toScreenY(wk.x, wk.y) + HH,
    heading: wk.heading,
    distance: wk.x + wk.y,
    moving: true,
    accent: wk.accent,
    reducedMotion: sim.ui.reducedMotion,
    cone: false,
    bag: wk.bag,
  })
}

interface Bay {
  x: number
  y: number
  cx: number
  cy: number
  axis: 'x' | 'y'
  d: number
}

/**
 * Finds the top-left tile of every block of PARKED_CAR and measures it. A tile
 * starts a block when neither its left nor its upper neighbour is a car, which
 * is enough because the bays are laid out with gaps between them.
 */
function collectParkedCars(g: Uint8Array, x0: number, x1: number, y0: number, y1: number): Bay[] {
  const out: Bay[] = []
  // Widen the scan so a bay whose origin is just off-screen still draws.
  const sx0 = Math.max(0, x0 - 5)
  const sx1 = Math.min(MAP_W - 1, x1 + 5)
  const sy0 = Math.max(0, y0 - 5)
  const sy1 = Math.min(MAP_H - 1, y1 + 5)

  for (let y = sy0; y <= sy1; y++) {
    for (let x = sx0; x <= sx1; x++) {
      if (g[idx(x, y)] !== T.PARKED_CAR) continue
      if (x > 0 && g[idx(x - 1, y)] === T.PARKED_CAR) continue
      if (y > 0 && g[idx(x, y - 1)] === T.PARKED_CAR) continue

      let bw = 1
      while (x + bw < MAP_W && g[idx(x + bw, y)] === T.PARKED_CAR) bw++
      let bh = 1
      while (y + bh < MAP_H && g[idx(x, y + bh)] === T.PARKED_CAR) bh++

      out.push({
        x,
        y,
        cx: x + bw / 2,
        cy: y + bh / 2,
        axis: bw >= bh ? 'x' : 'y',
        d: x + y + (bw + bh) / 2,
      })
    }
  }
  out.sort((a, b) => a.d - b.d)
  return out
}

function drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, base: string, t: number) {
  const lift = h * LIFT
  const tx = toScreenX(x, y)
  const ty = toScreenY(x, y)

  const left = shade(base, -0.34)
  const right = shade(base, -0.16)
  const top = shade(base, 0.1 + tileTint(x, y))

  // left face
  ctx.fillStyle = left
  ctx.beginPath()
  ctx.moveTo(tx - HW, ty + HH - lift)
  ctx.lineTo(tx, ty + TILE_H - lift)
  ctx.lineTo(tx, ty + TILE_H)
  ctx.lineTo(tx - HW, ty + HH)
  ctx.closePath()
  ctx.fill()

  // right face
  ctx.fillStyle = right
  ctx.beginPath()
  ctx.moveTo(tx + HW, ty + HH - lift)
  ctx.lineTo(tx, ty + TILE_H - lift)
  ctx.lineTo(tx, ty + TILE_H)
  ctx.lineTo(tx + HW, ty + HH)
  ctx.closePath()
  ctx.fill()

  // top face
  ctx.fillStyle = top
  diamond(ctx, x, y, lift)
  ctx.fill()

  if (t === T.SIGN) {
    ctx.save()
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(sim.time / 600)
    ctx.fillStyle = ACCENT
    diamond(ctx, x, y, lift)
    ctx.fill()
    ctx.restore()
  }
}

/** The player's own car: same vehicle renderer, warm paint, plus the pin and halo. */
function drawCar(ctx: CanvasRenderingContext2D) {
  const { x, y } = sim.car
  const tx = toScreenX(x, y)
  const ty = toScreenY(x, y)
  const found = sim.phase === 'carFound'
  const pulse = 0.5 + 0.5 * Math.sin(sim.time / 420)

  // Ground halo, so the car is findable before you can read its shape.
  ctx.save()
  ctx.globalAlpha = found ? 0.42 + pulse * 0.32 : 0.18 + pulse * 0.12
  ctx.fillStyle = WARM
  ctx.beginPath()
  ctx.ellipse(tx, ty + HH, HW * (found ? 3.4 : 2.5), HH * (found ? 3.4 : 2.5), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  drawVehicle(ctx, x, y, { model: 'suv', paint: WARM, axis: 'x', hero: true })

  // Marker pin, bobbing above the roof.
  const bob = Math.sin(sim.time / 500) * 4
  const pinY = ty - 2.1 * LIFT - 20 + bob
  ctx.save()
  ctx.fillStyle = WARM
  ctx.beginPath()
  ctx.moveTo(tx, pinY + 13)
  ctx.lineTo(tx - 5.5, pinY + 4)
  ctx.lineTo(tx + 5.5, pinY + 4)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(tx, pinY, 7.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#0B0F1A'
  ctx.beginPath()
  ctx.arc(tx, pinY, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  const { x, y } = sim.player
  drawAvatar(ctx, {
    x: toScreenX(x, y),
    y: toScreenY(x, y) + HH,
    heading: sim.player.heading,
    distance: sim.memory.total_distance_m,
    moving: sim.player.speed > 0.2,
    accent: sim.phase === 'offRoute' ? WARN : ACCENT,
    reducedMotion: sim.ui.reducedMotion,
    time: sim.time,
    bag: true,
  })
}

function drawLabels(ctx: CanvasRenderingContext2D) {
  const map = getMap(sim.player.floor)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const l of map.labels) {
    const sx = toScreenX(l.x, l.y)
    const sy = toScreenY(l.x, l.y) - 26
    const size = l.size ?? 12
    ctx.font = `600 ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(11,15,26,0.85)'
    ctx.strokeText(l.text, sx, sy)
    ctx.fillStyle = 'rgba(147,160,192,0.9)'
    ctx.fillText(l.text, sx, sy)
  }
  ctx.restore()
}

/** Exported for the map-integrity self-check in dev. */
export { isWalkable }
