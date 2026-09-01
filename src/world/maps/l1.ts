// L1 - Mall concourse, food court, atrium base, entrance hall.

import { T, isWalkable } from '../tiles'
import { FloorMap, MAP_W, MAP_H, rect, outline, encase, idx, ELEV, STAIR, ESC, liftEnclosure } from './build'

export function buildL1(): FloorMap {
  const g = new Uint8Array(MAP_W * MAP_H)

  // Main concourse along the long axis.
  rect(g, 8, 38, 104, 14, T.CORRIDOR)

  // North branch up to the stairs.
  rect(g, 20, 12, 12, 26, T.FLOOR)
  rect(g, STAIR.x, STAIR.y, STAIR.w, STAIR.h, T.STAIR_PAD)

  // Lift lobby - same grid coordinates on every floor.
  rect(g, 54, 26, 14, 12, T.FLOOR)
  rect(g, ELEV.x, ELEV.y, ELEV.w, ELEV.h, T.ELEV_PAD)
  liftEnclosure(g)

  // Food court, north-east, with a connector down to the concourse.
  rect(g, 80, 8, 32, 28, T.FLOOR)
  rect(g, 92, 34, 8, 5, T.CORRIDOR)

  // Atrium floor with a railed void, and the escalator on its east edge.
  rect(g, 20, 52, 36, 26, T.FLOOR)
  outline(g, 26, 58, 14, 14, T.RAIL)
  rect(g, 27, 59, 12, 12, T.VOID)
  rect(g, ESC.x, ESC.y, ESC.w, ESC.h, T.ESC_PAD)

  // Entrance hall, south.
  rect(g, 56, 52, 22, 26, T.FLOOR)
  rect(g, 60, 76, 14, 3, T.GLASS)

  encase(g, isWalkable, T.WALL)

  // Storefronts: re-skin runs of the concourse wall so it reads as retail.
  // Only ever re-skins WALL, so it can never seal a doorway.
  const skin = (x0: number, y: number, w: number, t: number) => {
    for (let i = x0; i < x0 + w; i++) if (g[idx(i, y)] === T.WALL) g[idx(i, y)] = t
  }
  for (let x = 12; x < 108; x += 9) {
    skin(x, 37, 6, x % 18 === 12 ? T.STORE : T.GLASS)
    skin(x, 52, 6, x % 18 === 12 ? T.GLASS : T.STORE)
  }

  // Seating clusters in the food court and planters on the concourse.
  for (const [px, py] of [
    [86, 14],
    [96, 14],
    [106, 14],
    [86, 24],
    [96, 24],
    [106, 24],
  ]) {
    rect(g, px, py, 3, 3, T.KIOSK)
  }
  for (let x = 16; x < 106; x += 14) {
    g[idx(x, 44)] = T.PLANTER
    g[idx(x + 1, 44)] = T.PLANTER
  }

  // A fountain in the atrium, on the railing's south edge.
  rect(g, 31, 74, 4, 2, T.PLANTER)

  return {
    floor: 1,
    grid: g,
    pads: [
      { id: 'elev-main', type: 'ELEVATOR', ...ELEV, targets: [-3, 1, 2] },
      { id: 'stair-north', type: 'STAIRS', ...STAIR, targets: [1, 2] },
      { id: 'esc-atrium', type: 'ESCALATOR', ...ESC, targets: [1, 2] },
    ],
    labels: [
      { x: 60, y: 45, text: 'L1 CONCOURSE', size: 14 },
      { x: 95, y: 20, text: 'FOOD COURT', size: 13 },
      { x: 59.5, y: 24.5, text: 'LIFTS', size: 15 },
      { x: 26, y: 16, text: 'STAIRS', size: 11 },
      { x: 33, y: 55, text: 'ATRIUM', size: 12 },
      { x: 66, y: 72, text: 'ENTRANCE', size: 12 },
    ],
  }
}
