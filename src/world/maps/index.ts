import { Floor } from '../../sim/state'
import { isWalkable } from '../tiles'
import { FloorMap, MAP_W, MAP_H, idx, Pad } from './build'
import { buildB3, CAR, SPAWN } from './b3'
import { buildL1 } from './l1'
import { buildL2 } from './l2'

export { MAP_W, MAP_H, CAR, SPAWN }
export type { FloorMap, Pad }

const maps: Record<number, FloorMap> = {
  [-3]: buildB3(),
  1: buildL1(),
  2: buildL2(),
}

export function getMap(f: Floor): FloorMap {
  return maps[f]
}

export function tileAt(f: Floor, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return 0
  return maps[f].grid[idx(x, y)]
}

export function walkableAt(f: Floor, wx: number, wy: number): boolean {
  return isWalkable(tileAt(f, Math.floor(wx), Math.floor(wy)))
}

/** Circle-vs-grid test used by movement. */
export function circleFree(f: Floor, wx: number, wy: number, r: number): boolean {
  const x0 = Math.floor(wx - r)
  const x1 = Math.floor(wx + r)
  const y0 = Math.floor(wy - r)
  const y1 = Math.floor(wy + r)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!isWalkable(tileAt(f, x, y))) {
        // nearest point on the tile to the circle centre
        const nx = Math.max(x, Math.min(wx, x + 1))
        const ny = Math.max(y, Math.min(wy, y + 1))
        const dx = wx - nx
        const dy = wy - ny
        if (dx * dx + dy * dy < r * r) return false
      }
    }
  }
  return true
}

/** The transition pad the player is standing on, if any. */
export function padUnder(f: Floor, wx: number, wy: number): Pad | null {
  for (const p of maps[f].pads) {
    if (wx >= p.x && wx < p.x + p.w && wy >= p.y && wy < p.y + p.h) return p
  }
  return null
}

/** Where to place the player when they arrive on a floor via a pad. */
export function padSpot(f: Floor, id: string): { x: number; y: number } {
  const p = maps[f].pads.find((q) => q.id === id) ?? maps[f].pads[0]
  return { x: p.x + p.w / 2, y: p.y + p.h / 2 }
}
