import { SIM } from './constants'
import { sim } from './state'

let prevX = 0
let prevY = 0
let primed = false

export function resetMetrics() {
  primed = false
  prevX = 0
  prevY = 0
}

/**
 * Distance, steps and turns. All three are DERIVED from a position the engine
 * already knows exactly. Nothing here is measured. See PRD section 17.12 for
 * what each one stands in for in the real product.
 */
export function deriveMetrics(dt: number) {
  if (!primed) {
    prevX = sim.player.x
    prevY = sim.player.y
    primed = true
    return
  }

  const d = Math.hypot(sim.player.x - prevX, sim.player.y - prevY)
  prevX = sim.player.x
  prevY = sim.player.y

  if (sim.phase === 'landing' || sim.transition.active) return

  if (d > 0) {
    sim.memory.total_distance_m += d
    sim.memory.steps_sim = Math.round(sim.memory.total_distance_m / SIM.STRIDE_M)
  }

  if (sim.player.speed > 0.2) {
    sim.memory.walk_duration_s += dt
    deriveTurn()
  } else {
    // Standing still ends any turn currently being accumulated.
    sim._turnAcc = 0
    sim._turnAccStart = sim.time
  }
}

function deriveTurn() {
  const h = sim.player.heading
  if (sim._turnAccStart === 0) {
    sim._headingEma = h
    sim._turnAccStart = sim.time
    return
  }

  let delta = h - sim._headingEma
  while (delta > Math.PI) delta -= 2 * Math.PI
  while (delta < -Math.PI) delta += 2 * Math.PI

  sim._headingEma += delta * SIM.HEADING_EMA
  sim._turnAcc += delta * SIM.HEADING_EMA

  if (sim.time - sim._turnAccStart > SIM.TURN_WINDOW_MS) {
    sim._turnAcc = 0
    sim._turnAccStart = sim.time
    return
  }

  const deg = (sim._turnAcc * 180) / Math.PI
  if (Math.abs(deg) >= SIM.TURN_THRESHOLD_DEG && sim.time - sim._lastTurnAt > SIM.TURN_COOLDOWN_MS) {
    sim.memory.turn_events.push({
      t: sim.time,
      type: deg > 0 ? 'RIGHT_TURN' : 'LEFT_TURN',
      angle: Math.abs(deg),
    })
    sim._lastTurnAt = sim.time
    sim._turnAcc = 0
    sim._turnAccStart = sim.time
  }
}
