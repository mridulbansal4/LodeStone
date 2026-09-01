import { SIM } from './constants'
import { sim, floorLabel, RouteNode } from './state'
import { buildSimplifiedRoute } from './trail'
import { buildSummary } from './summary'

/** Called by Find My Car. The return route is the player's own trail, reversed. */
export function buildRoute() {
  sim.memory.simplified = buildSimplifiedRoute()
  // Re-templated from the finished walk: the Memory Created card was a
  // snapshot from mid-walk, and the overview has to describe the whole route.
  sim.memory.summary = buildSummary()
  sim.nav.targetNodeIndex = 1
  sim.nav.active = false
  sim.nav.confidence = 1
  sim.nav.offRouteSince = null
  sim.nav.onRouteSince = null
}

export function startGuidance() {
  sim.nav.active = true
  sim.nav.returnStarted = sim.time
  advanceToNearestAhead()
}

function nodes(): RouteNode[] {
  return sim.memory.simplified
}

export function segDist(px: number, py: number, a: RouteNode, b: RouteNode) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return { d: Math.hypot(px - a.x, py - a.y), t: 0 }
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2))
  return { d: Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy)), t }
}

/**
 * Nearest point on the route, considering only segments on the floor the
 * player is actually standing on. Being on a floor the route never visits is
 * off-route by definition.
 */
export function nearestOnRoute(): { dist: number; index: number; t: number } {
  const n = nodes()
  let best = { dist: Infinity, index: -1, t: 0 }
  for (let i = 0; i < n.length - 1; i++) {
    if (n[i].floor !== sim.player.floor || n[i + 1].floor !== sim.player.floor) continue
    const r = segDist(sim.player.x, sim.player.y, n[i], n[i + 1])
    if (r.d < best.dist) best = { dist: r.d, index: i, t: r.t }
  }
  if (best.index === -1) {
    // No segment on this floor: fall back to the nearest node on any floor,
    // but report it as far away so the confidence model treats it as off-route.
    for (let i = 0; i < n.length; i++) {
      const d = Math.hypot(sim.player.x - n[i].x, sim.player.y - n[i].y)
      if (n[i].floor !== sim.player.floor) continue
      if (d < best.dist) best = { dist: d, index: i, t: 0 }
    }
    if (best.index === -1) best = { dist: 999, index: 0, t: 0 }
  }
  return best
}

/** Snap the target to the nearest node AHEAD, never behind the player. */
export function advanceToNearestAhead() {
  const near = nearestOnRoute()
  sim.nav.targetNodeIndex = Math.min(nodes().length - 1, near.index + 1)
}

export function updateNav() {
  const n = nodes()
  if (!sim.nav.active || n.length < 2) return

  // Advance past reached nodes.
  let guard = 0
  while (sim.nav.targetNodeIndex < n.length - 1 && guard++ < 64) {
    const t = n[sim.nav.targetNodeIndex]
    const d = Math.hypot(sim.player.x - t.x, sim.player.y - t.y)
    if (t.floor === sim.player.floor && d < SIM.NODE_REACH) sim.nav.targetNodeIndex++
    else break
  }

  sim.nav.distanceRemaining_m = remainingDistance()
  const instr = instructionFor()
  sim.nav.instruction = instr.primary
  sim.nav.secondary = instr.secondary
  if (sim.nav.returnStarted !== null) {
    sim.nav.returnDuration_s = (sim.time - sim.nav.returnStarted) / 1000
  }
}

function remainingDistance(): number {
  const n = nodes()
  const i = Math.min(sim.nav.targetNodeIndex, n.length - 1)
  let d = Math.hypot(sim.player.x - n[i].x, sim.player.y - n[i].y)
  for (let k = i; k < n.length - 1; k++) {
    d += Math.hypot(n[k + 1].x - n[k].x, n[k + 1].y - n[k].y)
  }
  return d
}

function turnSide(i: number): 'left' | 'right' {
  const n = nodes()
  const a = n[i - 1] ?? n[i]
  const b = n[i]
  const c = n[i + 1] ?? n[i]
  const h1 = Math.atan2(b.y - a.y, b.x - a.x)
  const h2 = Math.atan2(c.y - b.y, c.x - b.x)
  let d = h2 - h1
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  return d > 0 ? 'right' : 'left'
}

function instructionFor(): { primary: string; secondary: string } {
  const n = nodes()
  const i = Math.min(sim.nav.targetNodeIndex, n.length - 1)
  const target = n[i]
  const d = Math.hypot(sim.player.x - target.x, sim.player.y - target.y)
  const last = i >= n.length - 1

  if (last && d < 12) {
    return { primary: 'Your car is just ahead', secondary: 'In the recorded parking area' }
  }
  if (target.nodeType === 'transition' && target.transition) {
    const verb =
      target.transition === 'ELEVATOR' ? 'elevator' : target.transition === 'STAIRS' ? 'stairs' : 'escalator'
    const next = n[i + 1]
    const dir = next && next.floor < target.floor ? 'down' : 'up'
    const to = next ? floorLabel(next.floor) : floorLabel(target.floor)
    if (d > 10) return { primary: `Continue ${Math.round(d)} m`, secondary: `Then take the ${verb} ${dir} to ${to}` }
    return { primary: `Take the ${verb} ${dir} to ${to}`, secondary: 'Press E on the pad' }
  }
  if (target.nodeType === 'turn' && d < 15) {
    return { primary: `Turn ${turnSide(i)} ahead`, secondary: `${Math.round(d)} m` }
  }
  return {
    primary: `Continue ${Math.round(d)} m`,
    secondary: `${Math.round(sim.nav.distanceRemaining_m)} m to your car`,
  }
}
