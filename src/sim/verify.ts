import { sim, Floor } from './state'
import { walkableAt, circleFree } from '../world/maps'

/**
 * Route integrity checks.
 *
 * A test seam, like stepFrames() in loop.ts: nothing in the running app calls
 * these. They exist so the invariant "the return route is the recorded walk,
 * and the recorded walk is physically walkable" can be asserted rather than
 * assumed.
 */

export interface SegmentFault {
  index: number
  floor: Floor
  from: { x: number; y: number }
  to: { x: number; y: number }
  at: { x: number; y: number }
}

export interface RouteAudit {
  points: number
  segments: number
  samples: number
  faults: SegmentFault[]
  worstGap_m: number
}

/**
 * Walks a polyline at 0.2 m intervals and reports every sample that lands on a
 * non-walkable tile. Only segments whose endpoints share a floor are tested;
 * a floor change is a legitimate discontinuity, not a wall.
 */
export function auditPolyline(
  pts: { x: number; y: number; floor: Floor }[],
  opts: { radius?: number } = {},
): RouteAudit {
  const STEP = 0.2
  const r = opts.radius ?? 0
  const faults: SegmentFault[] = []
  let samples = 0
  let segments = 0
  let worstGap = 0

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (a.floor !== b.floor) continue
    segments++

    const len = Math.hypot(b.x - a.x, b.y - a.y)
    worstGap = Math.max(worstGap, len)
    const n = Math.max(1, Math.ceil(len / STEP))

    for (let k = 0; k <= n; k++) {
      const t = k / n
      const x = a.x + (b.x - a.x) * t
      const y = a.y + (b.y - a.y) * t
      samples++
      const ok = r > 0 ? circleFree(a.floor, x, y, r) : walkableAt(a.floor, x, y)
      if (!ok) {
        faults.push({
          index: i,
          floor: a.floor,
          from: { x: +a.x.toFixed(2), y: +a.y.toFixed(2) },
          to: { x: +b.x.toFixed(2), y: +b.y.toFixed(2) },
          at: { x: +x.toFixed(2), y: +y.toFixed(2) },
        })
        break // one fault per segment is enough to condemn it
      }
    }
  }

  return {
    points: pts.length,
    segments,
    samples,
    faults,
    worstGap_m: +worstGap.toFixed(2),
  }
}

/** The ribbon the user actually follows: the raw recorded walk, reversed. */
export function auditDrawnRibbon(): RouteAudit {
  return auditPolyline(sim.memory.path.slice().reverse())
}

/** The RDP skeleton that drives turn-by-turn wording. */
export function auditGuidanceSkeleton(): RouteAudit {
  return auditPolyline(sim.memory.simplified)
}

/** Every floor the route touches must appear as a continuous run, not a gap. */
export function auditFloorContinuity(): { transitions: number; gaps: number } {
  const p = sim.memory.path
  let transitions = 0
  let gaps = 0
  for (let i = 1; i < p.length; i++) {
    if (p[i].floor === p[i - 1].floor) continue
    transitions++
    // A legitimate transition is anchored by a sample on each floor at the
    // pad, so the two samples sit on top of each other in plan view.
    if (Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y) > 4) gaps++
  }
  return { transitions, gaps }
}
