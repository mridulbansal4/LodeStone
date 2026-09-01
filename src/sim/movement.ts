import { SIM } from './constants'
import { sim } from './state'
import { circleFree } from '../world/maps'

/**
 * Screen-relative movement, translated into world space.
 * In this projection screen-right is (x - y) increasing and screen-down is
 * (x + y) increasing, so the inverse is x = (u+v)/2, y = (v-u)/2.
 */
export function applyMovement(dt: number) {
  const i = sim.input
  let u = (i.right ? 1 : 0) - (i.left ? 1 : 0) + i.joy.x
  let v = (i.down ? 1 : 0) - (i.up ? 1 : 0) + i.joy.y

  const mag = Math.hypot(u, v)
  if (mag > 1) {
    u /= mag
    v /= mag
  }

  const target = mag > 0.05 ? (i.slow ? SIM.SLOW_SPEED : SIM.WALK_SPEED) : 0
  const dirX = mag > 0.05 ? (u + v) / 2 : 0
  const dirY = mag > 0.05 ? (v - u) / 2 : 0
  const dirLen = Math.hypot(dirX, dirY) || 1

  const desiredVx = (dirX / dirLen) * target
  const desiredVy = (dirY / dirLen) * target

  // Accelerate toward the desired velocity rather than snapping to it.
  const k = Math.min(1, (SIM.ACCEL * dt) / Math.max(SIM.WALK_SPEED, 0.001))
  sim.player.vx += (desiredVx - sim.player.vx) * k
  sim.player.vy += (desiredVy - sim.player.vy) * k

  if (Math.abs(sim.player.vx) < 0.01) sim.player.vx = 0
  if (Math.abs(sim.player.vy) < 0.01) sim.player.vy = 0

  const r = SIM.PLAYER_RADIUS
  const f = sim.player.floor

  // Resolve one axis at a time so the player slides along walls.
  const nx = sim.player.x + sim.player.vx * dt
  if (circleFree(f, nx, sim.player.y, r)) sim.player.x = nx
  else sim.player.vx = 0

  const ny = sim.player.y + sim.player.vy * dt
  if (circleFree(f, sim.player.x, ny, r)) sim.player.y = ny
  else sim.player.vy = 0

  sim.player.speed = Math.hypot(sim.player.vx, sim.player.vy)
  if (sim.player.speed > 0.05) {
    sim.player.heading = Math.atan2(sim.player.vy, sim.player.vx)
  }
}
