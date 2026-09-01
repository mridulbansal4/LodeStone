import { SIM } from './constants'
import { sim, Floor, floorLabel, setPhase, TransitionType } from './state'
import { padUnder, padSpot } from '../world/maps'
import { pushSample } from './trail'

/** Keep the "you can use this" prompt in sync with where the player stands. */
export function updatePadState() {
  const p = padUnder(sim.player.floor, sim.player.x, sim.player.y)
  if (!p || sim.transition.active) {
    sim.ui.canUse = false
    sim.ui.padType = null
    sim.ui.padTargets = []
    if (!p) sim.ui.floorPicker = false
    return
  }
  sim.ui.canUse = true
  sim.ui.padType = p.type
  sim.ui.padTargets = p.targets.filter((f) => f !== sim.player.floor) as Floor[]
}

/** Pressing Use. Elevators offer a choice; stairs and escalators are one hop. */
export function requestTransition() {
  if (!sim.ui.canUse || sim.transition.active) return
  const targets = sim.ui.padTargets
  if (targets.length === 1) {
    startTransition(targets[0])
  } else if (targets.length > 1) {
    sim.ui.floorPicker = true
  }
}

export function startTransition(to: Floor) {
  const pad = padUnder(sim.player.floor, sim.player.x, sim.player.y)
  if (!pad || sim.transition.active) return

  sim.ui.floorPicker = false
  sim.transition = {
    active: true,
    startedAt: sim.time,
    from: sim.player.floor,
    to,
    type: pad.type as TransitionType,
    padId: pad.id,
  }

  // Anchor the trail on the departure floor so the route never has a gap.
  pushSample({
    t: sim.time,
    x: sim.player.x,
    y: sim.player.y,
    heading: sim.player.heading,
    floor: sim.player.floor,
  })

  setPhase('floorTransition')
}

/** Runs the transition animation and lands the player on the target floor. */
export function updateTransition() {
  if (!sim.transition.active) return
  const elapsed = sim.time - sim.transition.startedAt
  const dur = sim.ui.reducedMotion ? 350 : SIM.FLOOR_TRANSITION_MS
  if (elapsed < dur * 0.5) return

  if (sim.player.floor !== sim.transition.to) {
    const spot = padSpot(sim.transition.to, sim.transition.padId)
    sim.player.floor = sim.transition.to
    sim.player.x = spot.x
    sim.player.y = spot.y
    sim.player.vx = 0
    sim.player.vy = 0

    sim.memory.floor_events.push({
      t: sim.time,
      type: sim.transition.type,
      from: sim.transition.from,
      to: sim.transition.to,
    })
    // Floor changes cost distance too - an elevator is not a teleport.
    sim.memory.total_distance_m += SIM.FLOOR_TRANSITION_DIST
    sim.memory.steps_sim = Math.round(sim.memory.total_distance_m / SIM.STRIDE_M)

    pushSample({
      t: sim.time,
      x: sim.player.x,
      y: sim.player.y,
      heading: sim.player.heading,
      floor: sim.player.floor,
    })
  }

  if (elapsed >= dur) {
    sim.transition.active = false
    if (sim.nav.active) setPhase('returnNav')
    else setPhase('remembering')
  }
}

export function transitionLabel(): string {
  const t = sim.transition
  const verb = t.type === 'ELEVATOR' ? 'Elevator' : t.type === 'STAIRS' ? 'Stairs' : 'Escalator'
  return `${verb} · ${floorLabel(t.from)} → ${floorLabel(t.to)}`
}
