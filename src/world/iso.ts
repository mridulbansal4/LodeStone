import { TILE_W, TILE_H } from '../sim/constants'

// 2:1 isometric. Screen-right is (x - y) increasing, screen-down is (x + y).
// The transform is orientation-preserving, so a right turn in the world reads
// as a right turn on screen.

export const HW = TILE_W / 2
export const HH = TILE_H / 2

export function toScreenX(x: number, y: number) {
  return (x - y) * HW
}
export function toScreenY(x: number, y: number) {
  return (x + y) * HH
}

/** Metres of vertical extrusion, in screen pixels. */
export const LIFT = TILE_H * 0.62

export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  if (amount >= 0) {
    r += (255 - r) * amount
    g += (255 - g) * amount
    b += (255 - b) * amount
  } else {
    r *= 1 + amount
    g *= 1 + amount
    b *= 1 + amount
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`
}
