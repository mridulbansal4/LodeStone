import { SIM } from './constants'
import { sim, floorLabel } from './state'

/**
 * The natural-language memory summary, templated purely from recorded facts.
 *
 * Deliberately says "the recorded parking area", never a slot number: a real
 * system could not know one, so this one does not invent one either.
 */
export function buildSummary(): string {
  const m = sim.memory
  const startFloor = m.path.length ? m.path[0].floor : sim.car.floor
  const dist = Math.round(m.total_distance_m / 10) * 10
  const minutes = Math.max(1, Math.ceil(m.total_distance_m / SIM.WALK_BACK_SPEED / 60))

  let middle = ''
  const last = m.floor_events[m.floor_events.length - 1]
  if (last) {
    const verb = last.type === 'ELEVATOR' ? 'elevator' : last.type === 'STAIRS' ? 'stairs' : 'escalator'
    const dir = sim.player.floor > startFloor ? 'up' : 'down'
    middle = ` and took the ${verb} ${dir} to ${floorLabel(sim.player.floor)}`
  }

  return `Parked on ${floorLabel(startFloor)}. You walked about ${dist} m${middle}. Roughly a ${minutes} minute walk back.`
}

export function shortSummary(): string {
  const m = sim.memory
  const floors = new Set(m.path.map((p) => p.floor)).size
  return `${Math.round(m.total_distance_m)} m · ${m.steps_sim} steps · ${floors} floors`
}
