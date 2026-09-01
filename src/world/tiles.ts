// Tile vocabulary. The whole mall is data: a per-floor Uint8Array of these ids.

export const T = {
  VOID: 0,
  FLOOR: 1,
  CORRIDOR: 2,
  WALL: 3,
  STORE: 4,
  GLASS: 5,
  PLANTER: 6,
  RAIL: 7,
  ROAD_MARK: 8,
  BAY: 9,
  PARKED_CAR: 10,
  ELEV_PAD: 11,
  STAIR_PAD: 12,
  ESC_PAD: 13,
  SIGN: 14,
  KIOSK: 15,
  DECK: 16,
  LIFT_WALL: 17,
} as const

export type TileId = (typeof T)[keyof typeof T]

const WALKABLE = new Set<number>([
  T.FLOOR,
  T.CORRIDOR,
  T.ROAD_MARK,
  T.BAY,
  T.ELEV_PAD,
  T.STAIR_PAD,
  T.ESC_PAD,
  T.DECK,
])

export function isWalkable(t: number): boolean {
  return WALKABLE.has(t)
}

/** Extrusion height in metres. 0 = flat, drawn as a plain diamond. */
export const HEIGHT: Record<number, number> = {
  [T.WALL]: 3.0,
  [T.LIFT_WALL]: 3.4,
  [T.STORE]: 3.4,
  [T.GLASS]: 2.6,
  [T.PLANTER]: 0.7,
  [T.PARKED_CAR]: 1.0,
  [T.KIOSK]: 1.8,
  [T.SIGN]: 2.2,
  [T.RAIL]: 0.9,
}

/** Base (top face) colour per tile. Sides are derived by shading. */
export const COLOR: Record<number, string> = {
  [T.FLOOR]: '#1E2740',
  [T.CORRIDOR]: '#232D4A',
  [T.DECK]: '#1A2238',
  [T.ROAD_MARK]: '#2C3556',
  [T.BAY]: '#202A46',
  [T.WALL]: '#2A3454',
  [T.LIFT_WALL]: '#37506B',
  [T.STORE]: '#313D63',
  [T.GLASS]: '#3A6C8A',
  [T.PLANTER]: '#2F6B57',
  [T.PARKED_CAR]: '#3C4670',
  [T.RAIL]: '#46527E',
  [T.KIOSK]: '#4A3C6B',
  [T.SIGN]: '#2E5A6E',
  [T.ELEV_PAD]: '#2B4E6B',
  [T.STAIR_PAD]: '#2B4E6B',
  [T.ESC_PAD]: '#2B4E6B',
}

/** Deterministic per-tile variation so large flat areas do not look printed. */
export function tileTint(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return (n - Math.floor(n) - 0.5) * 0.06
}
