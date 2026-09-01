/**
 * Ambient pedestrians.
 *
 * Purely decorative: their positions are a pure function of the clock, they
 * hold no state, they are never recorded into the route, and nothing collides
 * with them. The mall reads as occupied without any of it touching the
 * simulation the demo is actually measuring.
 */

import { Floor } from '../sim/state'

export interface Walker {
  x: number
  y: number
  heading: number
  accent: string
  bag: boolean
}

interface Route {
  floor: Floor
  /** Waypoints in world metres; the walker loops back and forth along them. */
  pts: [number, number][]
  speed: number
  accent: string
  bag: boolean
  /** Phase offset so a shared route does not move in lockstep. */
  offset: number
}

// Muted clothing, so pedestrians never compete with the accent trail or the car.
const ROUTES: Route[] = [
  // L1 concourse, the busiest run.
  { floor: 1, pts: [[16, 45], [104, 45]], speed: 1.25, accent: '#7C86A8', bag: true, offset: 0 },
  { floor: 1, pts: [[100, 48], [22, 48]], speed: 1.05, accent: '#9A7E86', bag: false, offset: 0.35 },
  { floor: 1, pts: [[26, 20], [26, 36], [40, 44]], speed: 1.15, accent: '#6E8C86', bag: true, offset: 0.6 },
  { floor: 1, pts: [[95, 14], [86, 30], [95, 40]], speed: 1.0, accent: '#8A83A6', bag: false, offset: 0.15 },
  // L2 balcony and concourse.
  { floor: 2, pts: [[20, 44], [100, 44]], speed: 1.2, accent: '#7C86A8', bag: false, offset: 0.5 },
  { floor: 2, pts: [[92, 20], [84, 40], [60, 46]], speed: 1.1, accent: '#9A8E70', bag: true, offset: 0.8 },
  { floor: 2, pts: [[30, 56], [46, 74], [30, 74]], speed: 0.95, accent: '#6E8C86', bag: false, offset: 0.25 },
  // B3, someone else heading for their own car.
  { floor: -3, pts: [[70, 45], [70, 70], [40, 74]], speed: 1.1, accent: '#8792A8', bag: true, offset: 0.4 },
]

/** Total length of a polyline, in metres. */
function pathLength(pts: [number, number][]): number {
  let d = 0
  for (let i = 0; i < pts.length - 1; i++) {
    d += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
  }
  return d
}

/** Position and heading at distance `s` along the polyline. */
function sample(pts: [number, number][], s: number): { x: number; y: number; heading: number } {
  let acc = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i]
    const [bx, by] = pts[i + 1]
    const seg = Math.hypot(bx - ax, by - ay)
    if (acc + seg >= s || i === pts.length - 2) {
      const t = seg === 0 ? 0 : Math.max(0, Math.min(1, (s - acc) / seg))
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, heading: Math.atan2(by - ay, bx - ax) }
    }
    acc += seg
  }
  return { x: pts[0][0], y: pts[0][1], heading: 0 }
}

/** Every pedestrian currently on the given floor, positioned from the clock. */
export function walkersOn(floor: Floor, timeMs: number): Walker[] {
  const out: Walker[] = []
  for (const r of ROUTES) {
    if (r.floor !== floor) continue
    const len = pathLength(r.pts)
    if (len === 0) continue
    // Ping-pong: one full cycle is out and back, with a pause folded into neither end.
    const period = (len / r.speed) * 2
    const t = ((timeMs / 1000 + r.offset * period) % period) / period
    const forward = t < 0.5
    const s = forward ? t * 2 * len : (1 - (t - 0.5) * 2) * len
    const p = sample(r.pts, s)
    out.push({
      x: p.x,
      y: p.y,
      heading: forward ? p.heading : p.heading + Math.PI,
      accent: r.accent,
      bag: r.bag,
    })
  }
  return out
}
