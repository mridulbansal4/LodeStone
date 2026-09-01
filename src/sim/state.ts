// The single mutable simulation state. This object is the one owner of truth.
// The world canvas, the phone map canvas and the React UI are all READERS.
// Nothing outside src/sim/ may mutate it.

export type Floor = -3 | 1 | 2
export const FLOOR_ORDER: Floor[] = [-3, 1, 2]

export function floorLabel(f: Floor): string {
  return f === -3 ? 'B3' : f === 1 ? 'L1' : 'L2'
}
export function floorName(f: Floor): string {
  return f === -3 ? 'B3 Parking' : f === 1 ? 'L1 Mall' : 'L2 Shopping'
}

export type Phase =
  | 'landing'
  | 'parked'
  | 'remembering'
  | 'floorTransition'
  | 'findMyCar'
  | 'routeOverview'
  | 'returnNav'
  | 'offRoute'
  | 'recovered'
  | 'carFound'

export type TransitionType = 'ELEVATOR' | 'STAIRS' | 'ESCALATOR'

export interface Sample {
  t: number
  x: number
  y: number
  heading: number
  floor: Floor
}

export interface RouteNode {
  x: number
  y: number
  floor: Floor
  nodeType?: 'turn' | 'transition'
  transition?: TransitionType
}

export interface TurnEvent {
  t: number
  type: 'LEFT_TURN' | 'RIGHT_TURN'
  angle: number
}

export interface FloorEvent {
  t: number
  type: TransitionType
  from: Floor
  to: Floor
}

export interface MagSample {
  t: number
  magnitude_uT: number
}

export interface SimObject {
  phase: Phase
  time: number // ms since demo start
  started: boolean

  player: { x: number; y: number; floor: Floor; heading: number; vx: number; vy: number; speed: number }
  car: { x: number; y: number; floor: Floor }
  camera: { x: number; y: number; zoom: number; initialised: boolean }

  input: { up: boolean; down: boolean; left: boolean; right: boolean; slow: boolean; joy: { x: number; y: number } }

  memory: {
    route_id: string
    created_at: string
    venue_hint: string
    path: Sample[]
    simplified: RouteNode[]
    turn_events: TurnEvent[]
    floor_events: FloorEvent[]
    magnetic_series_sim: MagSample[]
    total_distance_m: number
    steps_sim: number
    walk_duration_s: number
    created: boolean
    summary: string
  }

  nav: {
    active: boolean
    targetNodeIndex: number
    distanceRemaining_m: number
    instruction: string
    secondary: string
    confidence: number
    distToRoute: number
    offRouteSince: number | null
    onRouteSince: number | null
    returnStarted: number | null
    returnDuration_s: number
  }

  transition: {
    active: boolean
    startedAt: number
    from: Floor
    to: Floor
    type: TransitionType
    padId: string
  }

  ui: {
    canUse: boolean
    padType: TransitionType | null
    padTargets: Floor[]
    floorPicker: boolean
    toast: string | null
    toastUntil: number
    memoryCardUntil: number
    reducedMotion: boolean
    paused: boolean
  }

  // internal derivation scratch
  _lastSample: { x: number; y: number; t: number }
  _headingEma: number
  _turnAcc: number
  _turnAccStart: number
  _lastTurnAt: number
  _arriveSince: number | null
  _phaseAt: number
  _magT: number
}

function uuid(): string {
  // Not cryptographic. Demo identifier only.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const sim: SimObject = createInitial()

function createInitial(): SimObject {
  return {
    phase: 'landing',
    time: 0,
    started: false,
    player: { x: 0, y: 0, floor: -3, heading: 0, vx: 0, vy: 0, speed: 0 },
    car: { x: 0, y: 0, floor: -3 },
    camera: { x: 0, y: 0, zoom: 1, initialised: false },
    input: { up: false, down: false, left: false, right: false, slow: false, joy: { x: 0, y: 0 } },
    memory: {
      route_id: uuid(),
      created_at: new Date().toISOString(),
      venue_hint: 'Demo Mall (simulated)',
      path: [],
      simplified: [],
      turn_events: [],
      floor_events: [],
      magnetic_series_sim: [],
      total_distance_m: 0,
      steps_sim: 0,
      walk_duration_s: 0,
      created: false,
      summary: '',
    },
    nav: {
      active: false,
      targetNodeIndex: 0,
      distanceRemaining_m: 0,
      instruction: '',
      secondary: '',
      confidence: 1,
      distToRoute: 0,
      offRouteSince: null,
      onRouteSince: null,
      returnStarted: null,
      returnDuration_s: 0,
    },
    transition: { active: false, startedAt: 0, from: -3, to: -3, type: 'ELEVATOR', padId: 'elev-main' },
    ui: {
      canUse: false,
      padType: null,
      padTargets: [],
      floorPicker: false,
      toast: null,
      toastUntil: 0,
      memoryCardUntil: 0,
      reducedMotion: false,
      paused: false,
    },
    _lastSample: { x: 0, y: 0, t: 0 },
    _headingEma: 0,
    _turnAcc: 0,
    _turnAccStart: 0,
    _lastTurnAt: -9999,
    _arriveSince: null,
    _phaseAt: 0,
    _magT: 0,
  }
}

/** Wipe all state back to Landing. Used by Restart / Replay. */
export function resetSim() {
  const fresh = createInitial()
  fresh.ui.reducedMotion = sim.ui.reducedMotion
  Object.assign(sim, fresh)
}

export function setPhase(p: Phase) {
  if (sim.phase === p) return
  sim.phase = p
  sim._phaseAt = sim.time
}

export function toast(msg: string, ms = 1800) {
  sim.ui.toast = msg
  sim.ui.toastUntil = sim.time + ms
}
