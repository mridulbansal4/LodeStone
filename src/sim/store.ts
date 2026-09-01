import { create } from 'zustand'
import { sim, Phase, Floor, floorLabel, floorName, TransitionType } from './state'
import { confidenceBand, ConfBand } from './confidence'
import { transitionLabel } from './floors'

/**
 * A read-only mirror of the parts of `sim` that React needs to render.
 *
 * The simulation runs at 60 Hz on a plain mutable object; pushing that through
 * React every frame would be pointless work. Instead the loop calls syncUI()
 * once per tick and this store only updates the keys that actually changed,
 * so a stat ticking over never re-renders the world.
 */
export interface UiSnap {
  phase: Phase
  floor: Floor
  floorLbl: string
  floorNm: string
  distance: number
  steps: number
  turns: number
  elapsed: number
  instruction: string
  secondary: string
  confidence: number
  confBand: ConfBand
  distanceRemaining: number
  canUse: boolean
  padType: TransitionType | null
  padTargets: Floor[]
  floorPicker: boolean
  toast: string | null
  transitionActive: boolean
  transitionLbl: string
  memoryCreated: boolean
  memoryCardOpen: boolean
  summary: string
  floorEventCount: number
  routeLen: number
  returnDuration: number
  mobile: boolean
  reducedMotion: boolean
  showLegend: boolean
}

const initial: UiSnap = {
  phase: 'landing',
  floor: -3,
  floorLbl: 'B3',
  floorNm: 'B3 Parking',
  distance: 0,
  steps: 0,
  turns: 0,
  elapsed: 0,
  instruction: '',
  secondary: '',
  confidence: 1,
  confBand: 'High',
  distanceRemaining: 0,
  canUse: false,
  padType: null,
  padTargets: [],
  floorPicker: false,
  toast: null,
  transitionActive: false,
  transitionLbl: '',
  memoryCreated: false,
  memoryCardOpen: false,
  summary: '',
  floorEventCount: 0,
  routeLen: 0,
  returnDuration: 0,
  mobile: false,
  reducedMotion: false,
  showLegend: false,
}

export const useUi = create<UiSnap>(() => initial)

export function setUi(patch: Partial<UiSnap>) {
  useUi.setState(patch)
}

/** Called once per simulation tick. Only writes keys whose value moved. */
export function syncUI() {
  const s = useUi.getState()
  const patch: Partial<UiSnap> = {}
  const put = <K extends keyof UiSnap>(k: K, v: UiSnap[K]) => {
    if (s[k] !== v) (patch as Record<string, unknown>)[k as string] = v
  }

  put('phase', sim.phase)
  put('floor', sim.player.floor)
  put('floorLbl', floorLabel(sim.player.floor))
  put('floorNm', floorName(sim.player.floor))
  put('distance', Math.round(sim.memory.total_distance_m))
  put('steps', sim.memory.steps_sim)
  put('turns', sim.memory.turn_events.length)
  put('elapsed', Math.floor(sim.memory.walk_duration_s))
  put('instruction', sim.nav.instruction)
  put('secondary', sim.nav.secondary)
  put('confidence', Math.round(sim.nav.confidence * 100) / 100)
  put('confBand', confidenceBand(sim.nav.confidence))
  put('distanceRemaining', Math.round(sim.nav.distanceRemaining_m))
  put('canUse', sim.ui.canUse)
  put('padType', sim.ui.padType)
  put('floorPicker', sim.ui.floorPicker)
  put('toast', sim.time < sim.ui.toastUntil ? sim.ui.toast : null)
  put('transitionActive', sim.transition.active)
  put('transitionLbl', sim.transition.active ? transitionLabel() : s.transitionLbl)
  put('memoryCreated', sim.memory.created)
  put('memoryCardOpen', sim.time < sim.ui.memoryCardUntil)
  put('summary', sim.memory.summary)
  put('floorEventCount', sim.memory.floor_events.length)
  put('routeLen', sim.memory.simplified.length)
  put('returnDuration', Math.floor(sim.nav.returnDuration_s))
  put('reducedMotion', sim.ui.reducedMotion)

  const targets = sim.ui.padTargets
  if (targets.length !== s.padTargets.length || targets.some((t, i) => t !== s.padTargets[i])) {
    patch.padTargets = targets.slice()
  }

  if (Object.keys(patch).length) useUi.setState(patch)
}
