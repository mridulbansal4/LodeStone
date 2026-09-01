// B3 - Parking. The origin of every route.

import { T, isWalkable } from '../tiles'
import { FloorMap, MAP_W, MAP_H, rect, outline, encase, idx, ELEV, liftEnclosure } from './build'

// The player's car. Deliberately ~50 m from the lift lobby: the walk has to be
// long enough to actually be a memory.
export const CAR = { x: 28, y: 67.5, floor: -3 as const }
export const SPAWN = { x: 28, y: 71.5 }

export function buildB3(): FloorMap {
  const g = new Uint8Array(MAP_W * MAP_H)

  // The deck.
  rect(g, 4, 4, 112, 82, T.DECK)

  // Drive aisle markings down the middle of each aisle.
  for (const y of [17, 31, 45, 59, 73]) rect(g, 6, y, 108, 1, T.ROAD_MARK)

  // Parking bays in rows, with structural columns between them.
  const rows = [10, 24, 38, 52, 66]
  for (const ry of rows) {
    for (let x = 8; x <= 92; x += 6) {
      // keep the lift lobby clear
      if (x + 4 > 52 && x < 70 && ry + 3 > 24 && ry < 40) continue
      // leave the player's own bay empty so they can stand at the car
      const isHeroBay = ry === 66 && x === 26
      rect(g, x, ry, 4, 3, T.BAY)
      if (!isHeroBay) rect(g, x, ry, 4, 2, T.PARKED_CAR)
    }
  }

  // Structural columns on a regular grid - the thing that wrecks a compass.
  for (let x = 10; x < 112; x += 16) {
    for (let y = 8; y < 82; y += 14) {
      if (x > 50 && x < 70 && y > 22 && y < 40) continue
      if (x > 96) continue
      g[idx(x, y)] = T.WALL
    }
  }

  // Lift lobby.
  rect(g, 54, 26, 14, 12, T.FLOOR)
  rect(g, ELEV.x, ELEV.y, ELEV.w, ELEV.h, T.ELEV_PAD)
  liftEnclosure(g)
  g[idx(53, 31)] = T.SIGN
  g[idx(68, 31)] = T.SIGN

  // Payment kiosk near the lobby.
  rect(g, 71, 30, 2, 2, T.KIOSK)

  // Blocked ramp mouth - reads as an exit, is not one.
  rect(g, 110, 8, 5, 10, T.WALL)

  // Dead-end service corridor. This is the wrong-turn trap for the demo.
  rect(g, 98, 66, 1, 19, T.WALL)
  rect(g, 98, 66, 18, 1, T.WALL)
  rect(g, 98, 84, 18, 1, T.WALL)
  rect(g, 98, 74, 1, 3, T.DECK) // the one entrance
  g[idx(114, 82)] = T.KIOSK

  encase(g, isWalkable, T.WALL)

  // The player's bay, re-stamped after encasing so it stays clean. Must match
  // the isHeroBay coordinates above or the neighbouring car gets clipped.
  rect(g, 26, 66, 4, 3, T.BAY)
  outline(g, 26, 66, 4, 3, T.ROAD_MARK)

  return {
    floor: -3,
    grid: g,
    pads: [{ id: 'elev-main', type: 'ELEVATOR', ...ELEV, targets: [-3, 1, 2] }],
    labels: [
      { x: 20, y: 60, text: 'B3 PARKING', size: 16 },
      { x: 59.5, y: 24.5, text: 'LIFTS', size: 15 },
      { x: 106, y: 74, text: 'SERVICE', size: 10 },
      { x: 108, y: 14, text: 'RAMP CLOSED', size: 10 },
    ],
  }
}
