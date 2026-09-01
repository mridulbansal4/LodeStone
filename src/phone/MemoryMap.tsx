import { useEffect, useRef } from 'react'
import { sim, Floor } from '../sim/state'
import { getMap, MAP_W, MAP_H } from '../world/maps'
import { idx } from '../world/maps/build'
import { isWalkable } from '../world/tiles'

// A deliberately small isometric projection. It only has to READ as 3D at
// phone scale - there is no 3D rendering anywhere in this prototype.
const MHW = 1.32
const MHH = 0.66
const CELL = 3 // downsample factor for the floor plate
const PLATE_GAP = 44 // vertical separation between exploded floors

const FLOORS: Floor[] = [2, 1, -3] // painted back to front

const ACCENT = '#4DE1C1'
const WARM = '#FFB454'
const WARN = '#FF6B6B'

const maskCache = new Map<number, Uint8Array>()
const MW = Math.ceil(MAP_W / CELL)
const MH = Math.ceil(MAP_H / CELL)

/** Coarse walkable mask per floor: corridor spines and block masses only. */
function mask(f: Floor): Uint8Array {
  const hit = maskCache.get(f)
  if (hit) return hit
  const g = getMap(f).grid
  const m = new Uint8Array(MW * MH)
  for (let cy = 0; cy < MH; cy++) {
    for (let cx = 0; cx < MW; cx++) {
      let n = 0
      for (let y = cy * CELL; y < Math.min((cy + 1) * CELL, MAP_H); y++) {
        for (let x = cx * CELL; x < Math.min((cx + 1) * CELL, MAP_W); x++) {
          if (isWalkable(g[idx(x, y)])) n++
        }
      }
      m[cy * MW + cx] = n > CELL * CELL * 0.4 ? 1 : 0
    }
  }
  maskCache.set(f, m)
  return m
}

function floorOffset(f: Floor) {
  return f === -3 ? 0 : f === 1 ? -PLATE_GAP : -PLATE_GAP * 2
}

export function MemoryMap() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const frame = () => {
      raf = requestAnimationFrame(frame)
      draw(ctx, w, h)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" />
}

function sx(x: number, y: number) {
  return (x - y) * MHW
}
function sy(x: number, y: number, f: Floor) {
  return (x + y) * MHH + floorOffset(f)
}

let insets = { top: 0, bottom: 0 }
let insetTick = 0

/**
 * The band of the map that is not covered by the floating top bar or the
 * bottom sheet. Both are measured rather than assumed: the sheet's height is
 * content-driven and changes per state, and the top bar sits lower on desktop
 * (below the status bar) than it does on a real phone.
 *
 * Also publishes the sheet height as --sheet-h so the confidence chip and the
 * Memory Created card can sit just above the sheet in CSS.
 */
function measureInsets(canvas: HTMLCanvasElement): { top: number; bottom: number } {
  if (insetTick++ % 10 === 0) {
    const screen = canvas.closest('.phone-screen') as HTMLElement | null
    const c = canvas.getBoundingClientRect()
    const sheet = screen?.querySelector('.bottom-sheet') as HTMLElement | null
    const bar = screen?.querySelector('.top-bar') as HTMLElement | null

    let bottom = 0
    if (sheet && screen) {
      const sh = sheet.getBoundingClientRect()
      bottom = Math.max(0, Math.min(c.height, c.bottom - sh.top))
      screen.style.setProperty('--sheet-h', `${Math.round(sh.height)}px`)
    }

    const top = bar ? Math.max(0, Math.min(c.height, bar.getBoundingClientRect().bottom - c.top + 8)) : 0
    insets = { top, bottom }
  }
  return insets
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  if (!sim.started) return

  const overview = sim.phase === 'routeOverview' || sim.phase === 'findMyCar' || sim.phase === 'carFound'
  const routeFloors = new Set(sim.memory.simplified.map((n) => n.floor))
  const showAll = overview || sim.memory.simplified.length > 0

  // Draw into the band the top bar and the sheet leave free.
  const ins = measureInsets(ctx.canvas)
  const top = Math.min(ins.top, h * 0.34)
  const bottom = h - ins.bottom
  const availH = Math.max(60, bottom - top)
  const midY = (top + bottom) / 2

  ctx.save()
  if (showAll) {
    // Fit the whole exploded stack into whatever the sheet has left us.
    const pts: { x: number; y: number; floor: Floor }[] = sim.memory.simplified.length
      ? sim.memory.simplified
      : sim.memory.path
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const add = (px: number, py: number) => {
      minX = Math.min(minX, px)
      maxX = Math.max(maxX, px)
      minY = Math.min(minY, py)
      maxY = Math.max(maxY, py)
    }
    for (const p of pts) add(sx(p.x, p.y), sy(p.x, p.y, p.floor))
    add(sx(sim.car.x, sim.car.y), sy(sim.car.x, sim.car.y, sim.car.floor))
    add(sx(sim.player.x, sim.player.y), sy(sim.player.x, sim.player.y, sim.player.floor))
    // Include each visited floor's plate so the stack never gets clipped.
    for (const f of FLOORS) {
      if (!routeFloors.has(f) && f !== sim.player.floor) continue
      add(sx(0, 0), sy(0, 0, f))
      add(sx(MAP_W, MAP_H), sy(MAP_W, MAP_H, f))
      add(sx(MAP_W, 0), sy(MAP_W, 0, f))
      add(sx(0, MAP_H), sy(0, MAP_H, f))
    }
    const pad = 12
    const bw = Math.max(1, maxX - minX)
    const bh = Math.max(1, maxY - minY)
    const scale = Math.max(0.35, Math.min(2.4, Math.min((w - pad * 2) / bw, (availH - pad * 2) / bh)))
    ctx.translate(w / 2 - ((minX + maxX) / 2) * scale, midY - ((minY + maxY) / 2) * scale)
    ctx.scale(scale, scale)
  } else {
    const z = 1.6
    ctx.translate(
      w / 2 - sx(sim.player.x, sim.player.y) * z,
      midY - sy(sim.player.x, sim.player.y, sim.player.floor) * z,
    )
    ctx.scale(z, z)
  }

  for (const f of FLOORS) {
    if (!showAll && f !== sim.player.floor) continue
    const relevant = routeFloors.has(f) || f === sim.player.floor
    drawPlate(ctx, f, relevant)
  }

  if (showAll) drawShaft(ctx)

  for (const f of FLOORS) {
    if (!showAll && f !== sim.player.floor) continue
    drawTrail(ctx, f)
    drawRoute(ctx, f)
  }

  drawCar(ctx)
  drawPlayer(ctx)
  ctx.restore()
}

function drawPlate(ctx: CanvasRenderingContext2D, f: Floor, relevant: boolean) {
  const m = mask(f)
  const active = f === sim.player.floor
  ctx.save()
  ctx.globalAlpha = active ? 0.85 : relevant ? 0.4 : 0.16
  ctx.fillStyle = active ? '#233052' : '#1a2338'
  for (let cy = 0; cy < MH; cy++) {
    for (let cx = 0; cx < MW; cx++) {
      if (!m[cy * MW + cx]) continue
      const x = cx * CELL
      const y = cy * CELL
      const px = sx(x, y)
      const py = sy(x, y, f)
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px + MHW * CELL, py + MHH * CELL)
      ctx.lineTo(px, py + MHH * CELL * 2)
      ctx.lineTo(px - MHW * CELL, py + MHH * CELL)
      ctx.closePath()
      ctx.fill()
    }
  }
  ctx.restore()
}

/** The vertical line connecting the plates - reads instantly as one building. */
function drawShaft(ctx: CanvasRenderingContext2D) {
  const x = 59.5
  const y = 30
  ctx.save()
  ctx.strokeStyle = 'rgba(147,160,192,0.35)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(sx(x, y), sy(x, y, 2))
  ctx.lineTo(sx(x, y), sy(x, y, -3))
  ctx.stroke()
  ctx.restore()
}

function poly(ctx: CanvasRenderingContext2D, pts: { x: number; y: number; floor: Floor }[], f: Floor) {
  let started = false
  let any = false
  ctx.beginPath()
  for (const p of pts) {
    if (p.floor !== f) {
      started = false
      continue
    }
    const px = sx(p.x, p.y)
    const py = sy(p.x, p.y, f) + MHH
    if (!started) {
      ctx.moveTo(px, py)
      started = true
    } else {
      ctx.lineTo(px, py)
    }
    any = true
  }
  return any
}

function drawTrail(ctx: CanvasRenderingContext2D, f: Floor) {
  if (sim.memory.path.length < 2) return
  ctx.save()
  ctx.strokeStyle = ACCENT
  ctx.globalAlpha = f === sim.player.floor ? 0.5 : 0.25
  ctx.lineWidth = 1.6
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  if (poly(ctx, sim.memory.path, f)) ctx.stroke()
  ctx.restore()
}

function drawRoute(ctx: CanvasRenderingContext2D, f: Floor) {
  const n = sim.memory.simplified
  if (n.length < 2) return
  const off = sim.phase === 'offRoute'
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  ctx.globalAlpha = off ? 0.16 : 0.3
  ctx.lineWidth = 6
  ctx.strokeStyle = off ? WARN : ACCENT
  if (poly(ctx, n, f)) ctx.stroke()

  ctx.globalAlpha = off ? 0.55 : 1
  ctx.lineWidth = 2.4
  ctx.strokeStyle = off ? '#8390B4' : ACCENT
  if (poly(ctx, n, f)) ctx.stroke()
  ctx.restore()
}

function drawCar(ctx: CanvasRenderingContext2D) {
  const px = sx(sim.car.x, sim.car.y)
  const py = sy(sim.car.x, sim.car.y, sim.car.floor) + MHH
  const pulse = 0.5 + 0.5 * Math.sin(sim.time / 420)
  ctx.save()
  ctx.globalAlpha = 0.2 + pulse * 0.25
  ctx.fillStyle = WARM
  ctx.beginPath()
  ctx.arc(px, py, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(px, py, 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#0B0F1A'
  ctx.beginPath()
  ctx.arc(px, py, 1.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  const px = sx(sim.player.x, sim.player.y)
  const py = sy(sim.player.x, sim.player.y, sim.player.floor) + MHH
  const off = sim.phase === 'offRoute'
  const col = off ? WARN : ACCENT

  // heading cone
  const hx = sx(Math.cos(sim.player.heading), Math.sin(sim.player.heading))
  const hy = (Math.cos(sim.player.heading) + Math.sin(sim.player.heading)) * MHH
  const ang = Math.atan2(hy, hx)
  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(ang)
  ctx.globalAlpha = 0.3
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.moveTo(2, 0)
  ctx.lineTo(14, -7)
  ctx.lineTo(14, 7)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.arc(px, py, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.arc(px, py, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#0B0F1A'
  ctx.lineWidth = 1.4
  ctx.stroke()
  ctx.restore()
}

