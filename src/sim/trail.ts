import { SIM } from './constants'
import { sim, Sample, RouteNode, Floor } from './state'

/**
 * Trail sampling. Standing still records nothing, which is what keeps the
 * memory clean without any filtering later.
 */
export function sampleTrail() {
  if (sim.player.speed <= 0.05) return

  const d = Math.hypot(sim.player.x - sim._lastSample.x, sim.player.y - sim._lastSample.y)
  const dt = sim.time - sim._lastSample.t
  if (d < SIM.TRAIL_SAMPLE_DIST && dt < SIM.TRAIL_SAMPLE_TIME) return

  pushSample({
    t: sim.time,
    x: sim.player.x,
    y: sim.player.y,
    heading: sim.player.heading,
    floor: sim.player.floor,
  })
}

export function pushSample(s: Sample) {
  sim.memory.path.push(s)
  sim._lastSample = { x: s.x, y: s.y, t: s.t }

  // A magnetic magnitude trace, synthesised from position. Cosmetic only -
  // there is no magnetometer here. Labelled as simulated wherever it is shown.
  sim.memory.magnetic_series_sim.push({
    t: s.t,
    magnitude_uT:
      46 +
      9 * Math.sin(s.x * 0.31) +
      7 * Math.cos(s.y * 0.27) +
      4 * Math.sin((s.x + s.y) * 0.9),
  })

  if (sim.memory.path.length > SIM.MAX_SAMPLES) decimate()
}

/** Drop alternate samples from the middle. Endpoints are never touched. */
function decimate() {
  const p = sim.memory.path
  const m = sim.memory.magnetic_series_sim
  const keepP: Sample[] = [p[0]]
  for (let i = 1; i < p.length - 1; i++) if (i % 2 === 0) keepP.push(p[i])
  keepP.push(p[p.length - 1])
  sim.memory.path = keepP

  const keepM = [m[0]]
  for (let i = 1; i < m.length - 1; i++) if (i % 2 === 0) keepM.push(m[i])
  keepM.push(m[m.length - 1])
  sim.memory.magnetic_series_sim = keepM
}

type Pt = { x: number; y: number }

function perpDist(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/** Ramer-Douglas-Peucker. Turns a noisy trail into a route you can guide with. */
export function rdp<Tp extends Pt>(pts: Tp[], eps: number): Tp[] {
  if (pts.length < 3) return pts.slice()
  let maxD = 0
  let idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1])
    if (d > maxD) {
      maxD = d
      idx = i
    }
  }
  if (maxD <= eps) return [pts[0], pts[pts.length - 1]]
  const left = rdp(pts.slice(0, idx + 1), eps)
  const right = rdp(pts.slice(idx), eps)
  return left.slice(0, -1).concat(right)
}

/**
 * Removes loops from a path. If the path crosses itself or comes very close to a
 * previously visited point on the same floor, it pinches off the loop.
 */
export function removeLoops(path: Sample[], thresholdDist: number = 3.0): Sample[] {
  if (path.length < 3) return path.slice()

  const out: Sample[] = []
  let i = 0

  while (i < path.length) {
    out.push(path[i])
    
    // Look ahead for the furthest point that is close to the current point
    // We add a small offset (5 samples) so we don't pinch off immediate adjacent samples.
    let jumpTo = -1
    for (let j = path.length - 1; j > i + 5; j--) {
      if (path[i].floor !== path[j].floor) continue
      
      const d = Math.hypot(path[i].x - path[j].x, path[i].y - path[j].y)
      if (d < thresholdDist) {
        jumpTo = j
        break // Found the furthest point that forms a loop
      }
    }
    
    if (jumpTo !== -1) {
      // Pinch off the loop
      i = jumpTo
    } else {
      i++
    }
  }

  return out
}

/**
 * Build the return route: the player's own trail, reversed, simplified per
 * floor run so that a floor change always survives as its own node.
 */
export function buildSimplifiedRoute(): RouteNode[] {
  let rev = sim.memory.path.slice().reverse()
  if (rev.length === 0) return []
  
  // Strip out loops/detours before applying RDP simplification
  rev = removeLoops(rev)

  const out: RouteNode[] = []
  let run: Sample[] = []
  let runFloor: Floor = rev[0].floor

  const flush = (isLast: boolean) => {
    if (run.length === 0) return
    const simplified = rdp(run, SIM.RDP_EPSILON)
    for (let i = 0; i < simplified.length; i++) {
      const s = simplified[i]
      const isBoundary = !isLast && i === simplified.length - 1
      out.push({
        x: s.x,
        y: s.y,
        floor: runFloor,
        nodeType: isBoundary ? 'transition' : undefined,
      })
    }
    run = []
  }

  for (const s of rev) {
    if (s.floor !== runFloor) {
      flush(false)
      runFloor = s.floor
    }
    run.push(s)
  }
  flush(true)

  // Attach the transition type each boundary node stands for, walking the
  // recorded floor events backwards to match the reversed route.
  const evts = sim.memory.floor_events.slice().reverse()
  let e = 0
  for (const n of out) {
    if (n.nodeType === 'transition' && e < evts.length) n.transition = evts[e++].type
  }

  // Mark real turns so instruction generation has something to key off.
  for (let i = 1; i < out.length - 1; i++) {
    if (out[i].nodeType) continue
    const a = out[i - 1]
    const b = out[i]
    const c = out[i + 1]
    const h1 = Math.atan2(b.y - a.y, b.x - a.x)
    const h2 = Math.atan2(c.y - b.y, c.x - b.x)
    let d = ((h2 - h1) * 180) / Math.PI
    while (d > 180) d -= 360
    while (d < -180) d += 360
    if (Math.abs(d) > 40) out[i].nodeType = 'turn'
  }

  return out
}
