import { sim } from '../sim/state'
import { getMap, MAP_W, MAP_H } from './maps'
import { idx } from './maps/build'
import { T, HEIGHT, COLOR, isWalkable, tileTint } from './tiles'
import { HW, HH, LIFT, toScreenX, toScreenY, shade } from './iso'
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

function pathOnFloor(ctx: CanvasRenderingContext2D, pts: { x: number; y: number; floor: number }[]) {
  let started = false
  for (const p of pts) {
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

function drawRoute(ctx: CanvasRenderingContext2D) {
  const n = sim.memory.simplified
  if (n.length < 2) return
  const off = sim.phase === 'offRoute'

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Glow
  ctx.globalAlpha = off ? 0.12 : 0.28
  ctx.lineWidth = 16
  ctx.strokeStyle = off ? WARN : ACCENT
  ctx.beginPath()
  pathOnFloor(ctx, n)
  ctx.stroke()

  // Ribbon
  ctx.globalAlpha = off ? 0.4 : 1
  ctx.lineWidth = 6
  ctx.strokeStyle = off ? '#8390B4' : ACCENT
  ctx.beginPath()
  pathOnFloor(ctx, n)
  ctx.stroke()

  if (!off) drawChevrons(ctx, n)
  ctx.restore()
}

function drawChevrons(ctx: CanvasRenderingContext2D, n: { x: number; y: number; floor: number }[]) {
  const t = (sim.time / 900) % 1
  ctx.fillStyle = '#0B0F1A'
  for (let i = 0; i < n.length - 1; i++) {
    if (n[i].floor !== sim.player.floor || n[i + 1].floor !== sim.player.floor) continue
    const ax = toScreenX(n[i].x, n[i].y)
    const ay = toScreenY(n[i].x, n[i].y) + HH
    const bx = toScreenX(n[i + 1].x, n[i + 1].y)
    const by = toScreenY(n[i + 1].x, n[i + 1].y) + HH
    const len = Math.hypot(bx - ax, by - ay)
    const step = 46
    const count = Math.floor(len / step)
    const ang = Math.atan2(by - ay, bx - ax)
    for (let k = 0; k < count; k++) {
      const f = (k + t) / Math.max(count, 1)
      const px = ax + (bx - ax) * f
      const py = ay + (by - ay) * f
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(ang)
      ctx.beginPath()
      ctx.moveTo(-3, -4)
      ctx.lineTo(4, 0)
      ctx.lineTo(-3, 4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
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
  // Back-to-front along screen depth (x + y), so props and the avatar occlude
  // each other correctly with no z-buffer.
  const dMin = x0 + y0
  const dMax = x1 + y1
  const playerD = sim.player.x + sim.player.y
  const carD = sim.car.x + sim.car.y
  const carVisible = sim.car.floor === sim.player.floor
  let playerDrawn = false
  let carDrawn = false

  for (let d = dMin; d <= dMax; d++) {
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
      const h = HEIGHT[t]
      if (!h) continue
      drawBox(ctx, x, y, h, COLOR[t] ?? '#2A3454', t)
    }
  }
  if (carVisible && !carDrawn) drawCar(ctx)
  if (!playerDrawn) drawPlayer(ctx)
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

function drawCar(ctx: CanvasRenderingContext2D) {
  const { x, y } = sim.car
  const tx = toScreenX(x, y)
  const ty = toScreenY(x, y)
  const found = sim.phase === 'carFound'
  const pulse = 0.5 + 0.5 * Math.sin(sim.time / 420)

  // Halo on the ground
  ctx.save()
  ctx.globalAlpha = found ? 0.45 + pulse * 0.35 : 0.2 + pulse * 0.14
  ctx.fillStyle = WARM
  ctx.beginPath()
  ctx.ellipse(tx, ty + HH, HW * (found ? 3.4 : 2.4), HH * (found ? 3.4 : 2.4), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Body
  const lift = 1.1 * LIFT
  ctx.fillStyle = shade(WARM, -0.5)
  ctx.beginPath()
  ctx.moveTo(tx - HW * 1.3, ty + HH - lift)
  ctx.lineTo(tx, ty + TILE_H - lift)
  ctx.lineTo(tx, ty + TILE_H + 6)
  ctx.lineTo(tx - HW * 1.3, ty + HH + 6)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = shade(WARM, -0.3)
  ctx.beginPath()
  ctx.moveTo(tx + HW * 1.3, ty + HH - lift)
  ctx.lineTo(tx, ty + TILE_H - lift)
  ctx.lineTo(tx, ty + TILE_H + 6)
  ctx.lineTo(tx + HW * 1.3, ty + HH + 6)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = WARM
  ctx.beginPath()
  ctx.moveTo(tx, ty - lift + 2)
  ctx.lineTo(tx + HW * 1.3, ty + HH - lift)
  ctx.lineTo(tx, ty + TILE_H - lift)
  ctx.lineTo(tx - HW * 1.3, ty + HH - lift)
  ctx.closePath()
  ctx.fill()

  // Marker pin
  ctx.save()
  const bob = Math.sin(sim.time / 500) * 4
  ctx.globalAlpha = 0.95
  ctx.fillStyle = WARM
  ctx.beginPath()
  ctx.arc(tx, ty - lift - 24 + bob, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#0B0F1A'
  ctx.beginPath()
  ctx.arc(tx, ty - lift - 24 + bob, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  const { x, y } = sim.player
  const tx = toScreenX(x, y)
  const ty = toScreenY(x, y) + HH
  const moving = sim.player.speed > 0.2
  const bounce = moving && !sim.ui.reducedMotion ? Math.abs(Math.sin(sim.time / 90)) * 5 : 0

  // Shadow
  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(tx, ty, 11, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Heading cone
  ctx.save()
  ctx.globalAlpha = 0.28
  ctx.fillStyle = ACCENT
  const hx = toScreenX(Math.cos(sim.player.heading), Math.sin(sim.player.heading))
  const hy = toScreenY(Math.cos(sim.player.heading), Math.sin(sim.player.heading))
  const ang = Math.atan2(hy, hx)
  ctx.translate(tx, ty)
  ctx.rotate(ang)
  ctx.beginPath()
  ctx.moveTo(6, 0)
  ctx.lineTo(30, -13)
  ctx.lineTo(30, 13)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Body
  const bodyY = ty - 20 - bounce
  ctx.fillStyle = shade(ACCENT, -0.55)
  ctx.beginPath()
  ctx.ellipse(tx, bodyY + 12, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = ACCENT
  roundRect(ctx, tx - 7, bodyY, 14, 16, 6)
  ctx.fill()

  ctx.fillStyle = shade(ACCENT, 0.4)
  ctx.beginPath()
  ctx.arc(tx, bodyY - 5, 6.5, 0, Math.PI * 2)
  ctx.fill()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
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
