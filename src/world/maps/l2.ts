// L2 - Shopping: cinema, apparel court, balcony ring and the skybridge.

import { T, isWalkable } from '../tiles'
import { FloorMap, MAP_W, MAP_H, rect, outline, encase, idx, ELEV, STAIR, ESC } from './build'

export function buildL2(): FloorMap {
  const g = new Uint8Array(MAP_W * MAP_H)

  // Concourse, mirroring L1 so the vertical geometry lines up.
  rect(g, 8, 38, 104, 14, T.CORRIDOR)

  // Cinema block, west, with the stairs inside it.
  rect(g, 8, 10, 28, 26, T.FLOOR)
  rect(g, 20, 34, 8, 5, T.CORRIDOR)
  rect(g, STAIR.x, STAIR.y, STAIR.w, STAIR.h, T.STAIR_PAD)

  // Lift lobby - identical coordinates to B3 and L1.
  rect(g, 54, 26, 14, 12, T.FLOOR)
  rect(g, ELEV.x, ELEV.y, ELEV.w, ELEV.h, T.ELEV_PAD)

  // Apparel court, east.
  rect(g, 78, 10, 34, 26, T.FLOOR)
  rect(g, 90, 34, 8, 5, T.CORRIDOR)

  // Balcony ring around the atrium void, plus the escalator head.
  rect(g, 20, 52, 36, 26, T.FLOOR)
  outline(g, 26, 58, 14, 14, T.RAIL)
  rect(g, 27, 59, 12, 12, T.VOID)
  rect(g, ESC.x, ESC.y, ESC.w, ESC.h, T.ESC_PAD)

  // Encase before the skybridge, so the atrium void stays an open hole rather
  // than sprouting walls where the bridge meets it.
  encase(g, isWalkable, T.WALL)

  // Skybridge straight across the void - the landmark of the floor.
  rect(g, 26, 63, 14, 1, T.RAIL)
  rect(g, 26, 64, 14, 3, T.FLOOR)
  rect(g, 26, 67, 14, 1, T.RAIL)

  const skin = (x0: number, y: number, w: number, t: number) => {
    for (let i = x0; i < x0 + w; i++) if (g[idx(i, y)] === T.WALL) g[idx(i, y)] = t
  }
  for (let x = 12; x < 108; x += 9) {
    skin(x, 37, 6, x % 18 === 12 ? T.GLASS : T.STORE)
    skin(x, 52, 6, x % 18 === 12 ? T.STORE : T.GLASS)
  }

  // Cinema seating blocks and apparel fixtures.
  for (const [px, py] of [
    [12, 14],
    [12, 22],
    [12, 30],
    [84, 16],
    [94, 16],
    [104, 16],
    [84, 28],
    [94, 28],
  ]) {
    rect(g, px, py, 4, 3, T.KIOSK)
  }
  g[idx(30, 12)] = T.SIGN
  g[idx(96, 12)] = T.SIGN

  return {
    floor: 2,
    grid: g,
    pads: [
      { id: 'elev-main', type: 'ELEVATOR', ...ELEV, targets: [-3, 1, 2] },
      { id: 'stair-north', type: 'STAIRS', ...STAIR, targets: [1, 2] },
      { id: 'esc-atrium', type: 'ESCALATOR', ...ESC, targets: [1, 2] },
    ],
    labels: [
      { x: 60, y: 45, text: 'L2 SHOPPING', size: 14 },
      { x: 20, y: 20, text: 'CINEMA', size: 13 },
      { x: 94, y: 22, text: 'APPAREL', size: 13 },
      { x: 60, y: 24, text: 'LIFTS', size: 12 },
      { x: 33, y: 56, text: 'SKYBRIDGE', size: 11 },
    ],
  }
}
