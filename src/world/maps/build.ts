// Map authoring helpers. Floors are carved, not painted: start from VOID and
// carve walkable regions, then decorate. That guarantees connectivity is
// something we chose rather than something we hope for.

import { T } from '../tiles'

export const MAP_W = 120
export const MAP_H = 90

export interface Pad {
  id: string
  type: 'ELEVATOR' | 'STAIRS' | 'ESCALATOR'
  x: number
  y: number
  w: number
  h: number
  targets: number[] // floors reachable
}

export interface Label {
  x: number
  y: number
  text: string
  size?: number
}

export interface FloorMap {
  floor: -3 | 1 | 2
  grid: Uint8Array
  pads: Pad[]
  labels: Label[]
}

export function idx(x: number, y: number) {
  return y * MAP_W + x
}

export function rect(g: Uint8Array, x: number, y: number, w: number, h: number, t: number) {
  for (let j = y; j < y + h; j++) {
    if (j < 0 || j >= MAP_H) continue
    for (let i = x; i < x + w; i++) {
      if (i < 0 || i >= MAP_W) continue
      g[idx(i, j)] = t
    }
  }
}

/** Draw a 1-tile outline around a rect (used for walls and railings). */
export function outline(g: Uint8Array, x: number, y: number, w: number, h: number, t: number) {
  for (let i = x; i < x + w; i++) {
    if (i >= 0 && i < MAP_W) {
      if (y >= 0 && y < MAP_H) g[idx(i, y)] = t
      if (y + h - 1 >= 0 && y + h - 1 < MAP_H) g[idx(i, y + h - 1)] = t
    }
  }
  for (let j = y; j < y + h; j++) {
    if (j >= 0 && j < MAP_H) {
      if (x >= 0 && x < MAP_W) g[idx(x, j)] = t
      if (x + w - 1 >= 0 && x + w - 1 < MAP_W) g[idx(x + w - 1, j)] = t
    }
  }
}

/** Wrap every carved region in walls: any VOID tile touching a walkable tile. */
export function encase(g: Uint8Array, walkable: (t: number) => boolean, wall: number) {
  const out = new Uint8Array(g)
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (g[idx(x, y)] !== T.VOID) continue
      let touching = false
      for (let dy = -1; dy <= 1 && !touching; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue
          if (walkable(g[idx(nx, ny)])) {
            touching = true
            break
          }
        }
      }
      if (touching) out[idx(x, y)] = wall
    }
  }
  g.set(out)
}

// Shared vertical-transition coordinates. Keeping the elevator on identical
// grid coordinates across every floor is what makes the return route
// continuous through the shaft with no special-casing.
export const ELEV = { x: 57, y: 28, w: 5, h: 4 }
export const STAIR = { x: 22, y: 18, w: 4, h: 4 }
export const ESC = { x: 50, y: 58, w: 4, h: 4 }
