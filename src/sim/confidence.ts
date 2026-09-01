import { SIM } from './constants'
import { sim, setPhase, toast } from './state'
import { nearestOnRoute, advanceToNearestAhead } from './navigation'

/**
 * Off-route detection, recovery and the confidence chip.
 *
 * SIMULATED. This is a distance-to-route heuristic, not a localization
 * confidence. In the real product this is two separate scores - PDR quality
 * and DTW alignment cost. See PRD section 17.11.
 *
 * The 8 m out / 4 m in gap is hysteresis: without it the state flaps every
 * frame when the player walks along the threshold.
 */
export function updateConfidence() {
  if (!sim.nav.active || sim.memory.simplified.length < 2) return
  if (sim.transition.active) return

  const near = nearestOnRoute()
  sim.nav.distToRoute = near.dist

  const routeHasFloor = sim.memory.simplified.some((n) => n.floor === sim.player.floor)
  const raw = routeHasFloor ? Math.max(0, Math.min(1, 1 - near.dist / SIM.OFF_ROUTE_DIST)) : 0

  sim.nav.confidence += (raw - sim.nav.confidence) * SIM.CONFIDENCE_EMA

  const isOff = !routeHasFloor || near.dist > SIM.OFF_ROUTE_DIST
  const isOn = routeHasFloor && near.dist < SIM.RECOVER_DIST

  if (isOff) {
    sim.nav.onRouteSince = null
    if (sim.nav.offRouteSince === null) sim.nav.offRouteSince = sim.time
    // Being on a floor the route never visits is off-route immediately.
    const hold = routeHasFloor ? SIM.OFF_ROUTE_HOLD_MS : 0
    if (sim.time - sim.nav.offRouteSince >= hold && sim.phase !== 'offRoute') {
      sim.nav.confidence = 0
      setPhase('offRoute')
    }
  } else {
    sim.nav.offRouteSince = null
  }

  if (isOn) {
    if (sim.nav.onRouteSince === null) sim.nav.onRouteSince = sim.time
    if (sim.time - sim.nav.onRouteSince >= SIM.RECOVER_HOLD_MS && sim.phase === 'offRoute') {
      // Resume from a node ahead so guidance never sends you backwards.
      advanceToNearestAhead()
      sim.nav.confidence = 1
      setPhase('recovered')
      toast('Back on your route', SIM.RECOVERED_MS)
    }
  } else if (!isOff) {
    sim.nav.onRouteSince = null
  }

  if (sim.phase === 'recovered' && sim.time - sim._phaseAt > SIM.RECOVERED_MS) {
    setPhase('returnNav')
  }
}

export type ConfBand = 'High' | 'Medium' | 'Low'

export function confidenceBand(c: number): ConfBand {
  if (c >= 0.7) return 'High'
  if (c >= 0.35) return 'Medium'
  return 'Low'
}
