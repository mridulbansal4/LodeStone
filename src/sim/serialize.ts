import { sim, setPhase } from './state'
import { buildRoute } from './navigation'
import { buildSummary } from './summary'

/**
 * Export/restore a recorded run. Purpose: if a live walk goes wrong while
 * recording the demo video, reload a known-good run and reshoot the return
 * half without rewalking the first half. Never leaves the device.
 */
export function exportRun(): string {
  return JSON.stringify(
    {
      version: 1,
      note: 'SIMULATED run. Positions are game metres, not sensor output.',
      car: sim.car,
      memory: sim.memory,
    },
    null,
    2,
  )
}

export function loadRun(json: string): boolean {
  try {
    const data = JSON.parse(json)
    if (!data?.memory?.path?.length) return false
    sim.car = data.car
    Object.assign(sim.memory, data.memory)
    const lastSample = sim.memory.path[sim.memory.path.length - 1]
    sim.player.x = lastSample.x
    sim.player.y = lastSample.y
    sim.player.floor = lastSample.floor
    sim.started = true
    sim.memory.created = true
    sim.memory.summary = sim.memory.summary || buildSummary()
    buildRoute()
    setPhase('routeOverview')
    return true
  } catch {
    return false
  }
}

const KEY = 'parking-memory:last-run'

export function saveLocal() {
  try {
    localStorage.setItem(KEY, exportRun())
    return true
  } catch {
    return false
  }
}

export function loadLocal(): boolean {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? loadRun(raw) : false
  } catch {
    return false
  }
}
