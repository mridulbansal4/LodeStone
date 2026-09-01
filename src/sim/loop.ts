import { SIM } from './constants'
import { sim, setPhase } from './state'
import { applyMovement } from './movement'
import { sampleTrail } from './trail'
import { deriveMetrics } from './metrics'
import { updatePadState, updateTransition } from './floors'
import { updateNav } from './navigation'
import { updateConfidence } from './confidence'
import { buildSummary } from './summary'
import { beginGuidance, memoryReady } from './actions'
import { syncUI } from './store'

const STEP = 1000 / 60
let acc = 0
let last = 0
let running = false

export function startLoop() {
  if (running) return
  running = true
  last = performance.now()
  requestAnimationFrame(frame)
}

function frame(now: number) {
  requestAnimationFrame(frame)
  let delta = now - last
  last = now
  if (delta > 50) delta = 50 // survive tab switches
  acc += delta

  let guard = 0
  while (acc >= STEP && guard++ < 8) {
    tick(STEP)
    acc -= STEP
  }
  syncUI()
}

/**
 * Test seam: advance the simulation deterministically without waiting on
 * requestAnimationFrame. Used by the browser acceptance checks; the real app
 * always runs through startLoop().
 */
export function stepFrames(n: number) {
  for (let i = 0; i < n; i++) tick(STEP)
  syncUI()
}

function tick(ms: number) {
  const dt = ms / 1000
  if (sim.ui.paused) return

  // On the landing screen only time moves: the preview scene stays ambient and
  // nothing is recorded until the demo actually starts.
  if (sim.phase === 'landing') {
    sim.time += ms
    return
  }

  sim.time += ms

  if (sim.transition.active) {
    updateTransition()
  } else {
    applyMovement(dt)
    sampleTrail()
  }

  deriveMetrics(dt)
  updatePadState()
  updateNav()
  updateConfidence()
  updatePhase()
}

function updatePhase() {
  // Parked -> Remembering on the very first movement. No button, by design.
  if (sim.phase === 'parked' && sim.player.speed > 0.1) setPhase('remembering')

  // Memory Created is a PRESENTATION event. The route object has been building
  // continuously since the first step - that is the zero-effort principle.
  if (
    !sim.memory.created &&
    memoryReady() &&
    sim.memory.floor_events.length >= 1 &&
    !sim.transition.active &&
    !sim.nav.active
  ) {
    sim.memory.created = true
    sim.memory.summary = buildSummary()
    sim.ui.memoryCardUntil = sim.time + SIM.MEMORY_CARD_MS
  }

  if (sim.phase === 'findMyCar' && sim.time - sim._phaseAt >= SIM.MORPH_MS) {
    setPhase('routeOverview')
  }
  if (sim.phase === 'routeOverview' && sim.time - sim._phaseAt >= SIM.OVERVIEW_AUTO_MS) {
    beginGuidance()
  }

  checkArrival()
}

function checkArrival() {
  if (!sim.nav.active || sim.phase === 'carFound') return
  const onFloor = sim.player.floor === sim.car.floor
  const d = Math.hypot(sim.player.x - sim.car.x, sim.player.y - sim.car.y)
  if (onFloor && d < SIM.ARRIVE_DIST) {
    if (sim._arriveSince === null) sim._arriveSince = sim.time
    if (sim.time - sim._arriveSince >= SIM.ARRIVE_HOLD_MS) {
      sim.nav.active = false
      sim.nav.instruction = 'Car found'
      sim.nav.secondary = 'In the recorded parking area'
      setPhase('carFound')
    }
  } else {
    sim._arriveSince = null
  }
}
