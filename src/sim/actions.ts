import { SIM } from './constants'
import { sim, resetSim, setPhase, toast } from './state'
import { CAR, SPAWN } from '../world/maps'
import { toScreenX, toScreenY } from '../world/iso'
import { resetMetrics } from './metrics'
import { buildRoute, startGuidance } from './navigation'
import { setUi, syncUI } from './store'

/**
 * Places the camera over the parked car on B3 without starting the demo, so
 * the landing page has the real world behind it rather than a flat backdrop.
 * Records nothing: the phase stays 'landing', so the loop only advances time.
 */
export function initPreview() {
  sim.car = { ...CAR }
  sim.player.x = SPAWN.x
  sim.player.y = SPAWN.y
  sim.player.floor = CAR.floor
  sim.player.heading = Math.PI / 2
  // A fixed shot: the car sits right of centre so the copy on the left has a
  // clean field, and the deck reads behind it.
  sim.camera.x = toScreenX(CAR.x, CAR.y) - 205
  sim.camera.y = toScreenY(CAR.x, CAR.y) - 40
  sim.camera.zoom = 0.95
  sim.camera.initialised = true
}

export function startDemo() {
  resetSim()
  resetMetrics()
  sim.car = { ...CAR }
  sim.player.x = SPAWN.x
  sim.player.y = SPAWN.y
  sim.player.floor = CAR.floor
  sim.player.heading = Math.PI / 2
  sim.camera.initialised = false
  sim._lastSample = { x: SPAWN.x, y: SPAWN.y, t: 0 }
  sim.started = true
  setPhase('parked')
  setUi({ showLegend: false })
  syncUI()
}

export function restart() {
  const rm = sim.ui.reducedMotion
  resetSim()
  resetMetrics()
  sim.ui.reducedMotion = rm
  setUi({ showLegend: false })
  syncUI()
}

/** Whether there is enough of a walk to be worth remembering. */
export function memoryReady(): boolean {
  return sim.memory.total_distance_m >= SIM.MEMORY_MIN_DIST && sim.memory.path.length > 2
}

export function findMyCar() {
  if (!sim.started) return
  if (sim.phase === 'findMyCar' || sim.phase === 'routeOverview' || sim.nav.active) return
  if (!memoryReady()) {
    toast('Keep walking - building memory')
    syncUI()
    return
  }
  buildRoute()
  setPhase('findMyCar')
  syncUI()
}

export function beginGuidance() {
  if (sim.phase !== 'routeOverview') return
  startGuidance()
  setPhase('returnNav')
  syncUI()
}
