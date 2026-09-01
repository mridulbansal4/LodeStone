// Tuning constants. Every value here is a SIMULATION parameter, not a sensor
// characteristic. See docs/PARKING_MEMORY_PROTOTYPE_PRD.md section 7.13.

export const SIM = {
  // movement
  WALK_SPEED: 3.2,
  SLOW_SPEED: 1.3,
  SPRINT_SPEED: 6.4,
  ACCEL: 18,
  PLAYER_RADIUS: 0.35,

  // trail sampling
  TRAIL_SAMPLE_DIST: 1.5,
  TRAIL_SAMPLE_TIME: 400,
  MAX_SAMPLES: 4000,

  // derived metrics
  STRIDE_M: 0.72,
  FLOOR_TRANSITION_DIST: 6,
  TURN_THRESHOLD_DEG: 55,
  TURN_WINDOW_MS: 1200,
  TURN_COOLDOWN_MS: 1000,
  HEADING_EMA: 0.25,

  // memory + route
  MEMORY_MIN_DIST: 40,
  RDP_EPSILON: 5.0, // Increased from 1.2 to aggressively straighten out paths and ignore wiggles
  NODE_REACH: 3.0,

  // off route / recovery
  OFF_ROUTE_DIST: 8,
  OFF_ROUTE_HOLD_MS: 1200,
  RECOVER_DIST: 4,
  RECOVER_HOLD_MS: 600,
  CONFIDENCE_EMA: 0.15,

  // arrival
  ARRIVE_DIST: 3.5,
  ARRIVE_HOLD_MS: 400,

  // presentation
  WALK_BACK_SPEED: 1.2,
  CAMERA_LERP: 0.12,
  CAMERA_DEADZONE_PX: 48,
  ZOOM_MIN: 0.6,
  ZOOM_MAX: 1.6,

  // timings (ms)
  FLOOR_TRANSITION_MS: 1500,
  MEMORY_CARD_MS: 5000,
  MORPH_MS: 900,
  OVERVIEW_AUTO_MS: 4000,
  RECOVERED_MS: 1500,
} as const

export const TILE_W = 64
export const TILE_H = 32
