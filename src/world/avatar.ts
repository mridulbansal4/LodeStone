/**
 * The walking character.
 *
 * Drawn in screen space anchored at the feet, because at roughly 34 px tall a
 * readable silhouette matters far more than true isometric geometry. The
 * figure is built back-to-front (far limb, body, near limb) so it reads as
 * three-quarter view, and the walk cycle is driven by distance travelled
 * rather than wall time, so the stride matches the speed instead of sliding.
 */

import { toScreenX, toScreenY } from './iso'

const SKIN = '#E8B58B'
const HAIR = '#22242E'
const TROUSER = '#46506B'
const TROUSER_DARK = '#333B52'
const SHOE = '#1B1F2B'

export interface AvatarOptions {
  /** Feet position, already projected to screen space. */
  x: number
  y: number
  /** World-space heading, in radians. */
  heading: number
  /** Metres walked, drives the stride phase. */
  distance: number
  moving: boolean
  /** Jacket colour: the same accent as the memory trail. */
  accent: string
  reducedMotion: boolean
  /** Wall-clock ms, used only for the idle sway. */
  time?: number
  /** Ambient pedestrians skip the heading cone; it belongs to the player. */
  cone?: boolean
  bag?: boolean
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function drawAvatar(ctx: CanvasRenderingContext2D, o: AvatarOptions) {
  const { x, y } = o

  // Heading in screen space: the projection is orientation-preserving, so a
  // right turn in the world is a right turn on screen.
  const hx = toScreenX(Math.cos(o.heading), Math.sin(o.heading))
  const hy = toScreenY(Math.cos(o.heading), Math.sin(o.heading))
  const ang = Math.atan2(hy, hx)
  const faceX = Math.cos(ang)
  const faceY = Math.sin(ang)
  const dir = faceX >= 0 ? 1 : -1
  // Facing toward the camera shows the front of the figure; away shows the back.
  const front = faceY >= -0.15

  // One full stride per 0.9 m, so the legs never skate.
  const phase = o.moving && !o.reducedMotion ? (o.distance / 0.9) * Math.PI * 2 : 0
  const swing = Math.sin(phase)
  // Standing still still breathes, so the figure never looks like a decal.
  const idle =
    !o.moving && !o.reducedMotion && o.time !== undefined ? Math.sin(o.time / 900) * 0.5 : 0
  const bob = (o.moving && !o.reducedMotion ? Math.abs(Math.sin(phase)) * 2.2 : 0) + idle

  // Ground shadow, squashed along the isometric ground plane.
  ctx.save()
  ctx.globalAlpha = 0.38
  ctx.fillStyle = '#05070c'
  ctx.beginPath()
  ctx.ellipse(x, y, 9, 4.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Heading cone: a soft wedge on the ground, so facing is legible even when
  // the figure itself is only a few pixels wide.
  if (o.cone !== false) {
  ctx.save()
  ctx.globalAlpha = 0.24
  ctx.fillStyle = o.accent
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.beginPath()
  ctx.moveTo(3, 0)
  ctx.lineTo(19, -8)
  ctx.lineTo(19, 8)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  }

  const hipY = y - 15 - bob
  const shoulderY = y - 27 - bob
  const legSpread = 3.1

  const leg = (offset: number, colour: string) => {
    const kx = x + offset * dir * 0.5
    ctx.fillStyle = colour
    roundRect(ctx, kx - 2.6, hipY - 1, 5.2, 13 + offset * 0.35, 2.4)
    ctx.fill()
    ctx.fillStyle = SHOE
    roundRect(ctx, kx - 3.1 + offset * dir * 0.35, hipY + 11 + offset * 0.3, 6.2, 3.2, 1.5)
    ctx.fill()
  }

  const arm = (offset: number, colour: string) => {
    ctx.fillStyle = colour
    roundRect(ctx, x + offset * dir * 0.55 - 2.1, shoulderY + 1, 4.2, 12, 2)
    ctx.fill()
  }

  const jacketDark = mix(o.accent, '#0B0F1A', 0.42)

  // Dark rim behind the figure: at this size the silhouette does the work, and
  // the deck is nearly the same value as the clothing without it.
  ctx.save()
  ctx.strokeStyle = 'rgba(6,9,16,0.55)'
  ctx.lineWidth = 3.2
  ctx.lineJoin = 'round'
  roundRect(ctx, x - 6.6, shoulderY - 0.6, 13.2, 27, 4.6)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, shoulderY - 5.5, 5.9, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // Far limbs first, then the pack, then the torso over the top of it.
  leg(-swing * legSpread, TROUSER_DARK)
  arm(swing * legSpread, jacketDark)

  if (o.bag) {
    ctx.fillStyle = mix(o.accent, '#0B0F1A', 0.6)
    roundRect(ctx, x - 7.4 - dir * 1.6, shoulderY + 2.5, 14.8, 11, 3.4)
    ctx.fill()
  }

  // Torso: a tapered jacket, slightly narrower at the waist.
  ctx.fillStyle = o.accent
  roundRect(ctx, x - 6, shoulderY, 12, 15, 4)
  ctx.fill()
  // Shoulder highlight, to lift it off the deck.
  ctx.fillStyle = mix(o.accent, '#FFFFFF', 0.22)
  roundRect(ctx, x - 6, shoulderY, 12, 4.5, 3)
  ctx.fill()

  // Head.
  const headY = shoulderY - 5.5
  ctx.fillStyle = SKIN
  ctx.beginPath()
  ctx.arc(x, headY, 5.2, 0, Math.PI * 2)
  ctx.fill()
  // Hair: a cap over the crown, shifted away from the facing side.
  ctx.fillStyle = HAIR
  ctx.beginPath()
  ctx.arc(x - dir * 0.7, headY - 1.1, 5.1, Math.PI * (front ? 1.02 : 0), Math.PI * (front ? 2.05 : 2))
  ctx.fill()

  // Near limbs last.
  leg(swing * legSpread, TROUSER)
  arm(-swing * legSpread, o.accent)
}

/** Linear blend between two hex colours. */
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const r = Math.round((((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t))
  const g = Math.round((((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t))
  const bl = Math.round(((pa & 255) * (1 - t) + (pb & 255) * t))
  return `rgb(${r},${g},${bl})`
}
