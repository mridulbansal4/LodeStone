/**
 * Isometric vehicles, drawn procedurally as stacked prisms.
 *
 * No sprite atlas: each car is a lower body, a glazed cabin and four wheels,
 * projected through the same isometric transform as the world tiles, so they
 * sit correctly at any grid position and depth-sort with everything else.
 */

import { HW, HH, LIFT, toScreenX, toScreenY, shade } from './iso'

export type CarModel = 'sports' | 'suv' | 'hatchback'

interface Spec {
  /** Body length and width in metres. */
  len: number
  wid: number
  /** Lower body sits between these heights. */
  bodyLo: number
  bodyHi: number
  /** Cabin start/end as a fraction of length, measured from the rear. */
  cabFrom: number
  cabTo: number
  /** How far the cabin is pulled in from the flanks, in metres. */
  cabInset: number
  cabHi: number
  wheelR: number
  /** Rake of the nose: how much the front of the lower body is shaved. */
  nose: number
}

const SPECS: Record<CarModel, Spec> = {
  // Deliberately stylised: real cars are ~4.5 m long against 1.8 m tall, and at
  // this projection that ratio reads as a flat slab. Shortening the wheelbase
  // and keeping the height gives a silhouette that still says "car" at 60 px.
  sports: {
    len: 3.2, wid: 1.7, bodyLo: 0.38, bodyHi: 0.95,
    cabFrom: 0.3, cabTo: 0.68, cabInset: 0.3, cabHi: 1.35, wheelR: 0.33, nose: 0.3,
  },
  suv: {
    len: 3.3, wid: 1.8, bodyLo: 0.44, bodyHi: 1.15,
    cabFrom: 0.22, cabTo: 0.8, cabInset: 0.26, cabHi: 1.8, wheelR: 0.4, nose: 0.12,
  },
  hatchback: {
    len: 3.0, wid: 1.65, bodyLo: 0.4, bodyHi: 1.02,
    cabFrom: 0.28, cabTo: 0.8, cabInset: 0.27, cabHi: 1.52, wheelR: 0.35, nose: 0.2,
  },
}

/** Muted lot colours: varied enough to read as a car park, quiet enough to sit behind the UI. */
const PAINT = [
  '#8E97AB', // silver
  '#3E4657', // graphite
  '#2E4A6B', // deep blue
  '#6B3540', // maroon
  '#B9BEC7', // white
  '#3B5A4A', // forest
  '#4A4258', // plum grey
  '#5A6472', // slate
]

/** Deterministic per-position pick, so the lot never reshuffles between frames. */
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

export function pickModel(x: number, y: number): CarModel {
  const h = hash(x, y)
  return h < 0.36 ? 'suv' : h < 0.72 ? 'hatchback' : 'sports'
}

export function pickPaint(x: number, y: number): string {
  return PAINT[Math.floor(hash(y, x) * PAINT.length) % PAINT.length]
}

function sx(wx: number, wy: number) {
  return toScreenX(wx, wy)
}
function sy(wx: number, wy: number, h: number) {
  return toScreenY(wx, wy) - h * LIFT
}

/**
 * An axis-aligned box in world space. Only the two camera-facing flanks and the
 * top are drawn; the far faces are always hidden in this projection.
 */
function prism(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  l: number,
  h0: number,
  h1: number,
  top: string,
  left: string,
  right: string,
) {
  const x1 = x0 + w
  const y1 = y0 + l

  // +x flank, falling to the lower right
  ctx.fillStyle = right
  ctx.beginPath()
  ctx.moveTo(sx(x1, y0), sy(x1, y0, h1))
  ctx.lineTo(sx(x1, y1), sy(x1, y1, h1))
  ctx.lineTo(sx(x1, y1), sy(x1, y1, h0))
  ctx.lineTo(sx(x1, y0), sy(x1, y0, h0))
  ctx.closePath()
  ctx.fill()

  // +y flank, falling to the lower left
  ctx.fillStyle = left
  ctx.beginPath()
  ctx.moveTo(sx(x0, y1), sy(x0, y1, h1))
  ctx.lineTo(sx(x1, y1), sy(x1, y1, h1))
  ctx.lineTo(sx(x1, y1), sy(x1, y1, h0))
  ctx.lineTo(sx(x0, y1), sy(x0, y1, h0))
  ctx.closePath()
  ctx.fill()

  // roof
  ctx.fillStyle = top
  ctx.beginPath()
  ctx.moveTo(sx(x0, y0), sy(x0, y0, h1))
  ctx.lineTo(sx(x1, y0), sy(x1, y0, h1))
  ctx.lineTo(sx(x1, y1), sy(x1, y1, h1))
  ctx.lineTo(sx(x0, y1), sy(x0, y1, h1))
  ctx.closePath()
  ctx.fill()
}

export interface CarOptions {
  model: CarModel
  paint: string
  /** 'x' points the bonnet down the +x axis, 'y' down the +y axis. */
  axis: 'x' | 'y'
  /** Lights on, slightly glossier paint: used for the player's own car. */
  hero?: boolean
}

/**
 * Draws one vehicle centred in the given world-space cell.
 * (cx, cy) is the centre of the parking bay, in metres.
 */
export function drawVehicle(ctx: CanvasRenderingContext2D, cx: number, cy: number, o: CarOptions) {
  const s = SPECS[o.model]
  const alongX = o.axis === 'x'
  const L = s.len
  const W = s.wid

  // Footprint in world space, oriented along the chosen axis.
  const bw = alongX ? L : W
  const bl = alongX ? W : L
  const x0 = cx - bw / 2
  const y0 = cy - bl / 2

  const body = o.paint
  const deck = shade(body, 0.12)
  const roof = shade(body, -0.04)
  const flankL = shade(body, -0.3)
  const flankR = shade(body, -0.12)
  const glass = o.hero ? '#2C3B48' : '#242D3C'
  const screen = shade(glass, 0.26)

  // Contact shadow, so the car sits on the deck instead of hovering.
  ctx.save()
  ctx.globalAlpha = 0.34
  ctx.fillStyle = '#05070c'
  ctx.beginPath()
  ctx.ellipse(sx(cx, cy), toScreenY(cx, cy) + HH * 0.1, HW * (bw / 2.6), HH * (bl / 1.5), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Wheels. The body is lifted clear of the deck and the tyres are set a touch
  // proud of the flanks, so they read from this angle instead of hiding under
  // the sills.
  const tyre = '#191D26'
  const tyreDark = '#0E1116'
  const proud = 0.05
  const inset = 0.5
  const wheelW = alongX ? s.wheelR * 1.45 : W * 0.2 + proud * 2
  const wheelL = alongX ? W * 0.2 + proud * 2 : s.wheelR * 1.45
  const ends = alongX
    ? [x0 + inset, x0 + bw - inset - wheelW]
    : [y0 + inset, y0 + bl - inset - wheelL]
  for (const e of ends) {
    for (const side of [0, 1]) {
      const wx = alongX ? e : x0 - proud + (side ? bw - wheelW + proud * 2 : 0)
      const wy = alongX ? y0 - proud + (side ? bl - wheelL + proud * 2 : 0) : e
      prism(ctx, wx, wy, wheelW, wheelL, 0, s.wheelR * 1.9, tyreDark, tyreDark, tyre)
    }
  }

  // Lower body, with the nose shaved back so the front reads as a bonnet.
  const noseCut = s.nose * 0.5
  prism(
    ctx,
    alongX ? x0 + noseCut : x0,
    alongX ? y0 : y0 + noseCut,
    alongX ? bw - noseCut : bw,
    alongX ? bl : bl - noseCut,
    s.bodyLo,
    s.bodyHi,
    deck,
    flankL,
    flankR,
  )

  // Glazed cabin, pulled in from the flanks and set back along the length.
  const cabStart = s.cabFrom * L
  const cabLen = (s.cabTo - s.cabFrom) * L
  prism(
    ctx,
    alongX ? x0 + cabStart : x0 + s.cabInset,
    alongX ? y0 + s.cabInset : y0 + cabStart,
    alongX ? cabLen : bw - s.cabInset * 2,
    alongX ? bl - s.cabInset * 2 : cabLen,
    s.bodyHi,
    s.cabHi,
    roof,
    alongX ? glass : screen,
    alongX ? screen : glass,
  )

  // Light bar across the nose.
  const lit = o.hero ? '#FFE7B0' : '#C9D4E4'
  ctx.save()
  ctx.globalAlpha = o.hero ? 0.95 : 0.5
  ctx.fillStyle = lit
  const lh = s.bodyLo + (s.bodyHi - s.bodyLo) * 0.55
  if (alongX) {
    const fx = x0 + bw - 0.06
    ctx.beginPath()
    ctx.moveTo(sx(fx, y0 + 0.22), sy(fx, y0 + 0.22, lh + 0.12))
    ctx.lineTo(sx(fx, y0 + bl - 0.22), sy(fx, y0 + bl - 0.22, lh + 0.12))
    ctx.lineTo(sx(fx, y0 + bl - 0.22), sy(fx, y0 + bl - 0.22, lh - 0.06))
    ctx.lineTo(sx(fx, y0 + 0.22), sy(fx, y0 + 0.22, lh - 0.06))
    ctx.closePath()
  } else {
    const fy = y0 + bl - 0.06
    ctx.beginPath()
    ctx.moveTo(sx(x0 + 0.22, fy), sy(x0 + 0.22, fy, lh + 0.12))
    ctx.lineTo(sx(x0 + bw - 0.22, fy), sy(x0 + bw - 0.22, fy, lh + 0.12))
    ctx.lineTo(sx(x0 + bw - 0.22, fy), sy(x0 + bw - 0.22, fy, lh - 0.06))
    ctx.lineTo(sx(x0 + 0.22, fy), sy(x0 + 0.22, fy, lh - 0.06))
    ctx.closePath()
  }
  ctx.fill()
  ctx.restore()
}
