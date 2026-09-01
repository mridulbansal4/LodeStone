import { SIM } from './constants'
import { sim, resetSim, setPhase, toast } from './state'
import { CAR, SPAWN } from '../world/maps'
import { resetMetrics } from './metrics'
import { buildRoute, startGuidance } from './navigation'
import { setUi } from './store'

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
}

export function restart() {
  const rm = sim.ui.reducedMotion
  resetSim()
  resetMetrics()
  sim.ui.reducedMotion = rm
  setUi({ showLegend: false })
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
    return
  }
  buildRoute()
  setPhase('findMyCar')
}

export function beginGuidance() {
  if (sim.phase !== 'routeOverview') return
  startGuidance()
  setPhase('returnNav')
}
