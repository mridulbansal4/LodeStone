import { SIM } from '../sim/constants'
import { sim } from '../sim/state'
import { toScreenX, toScreenY } from './iso'

/**
 * Smooth follow with a dead-zone. The dead-zone is what stops the frame
 * jittering when the player taps a direction key.
 */
export function updateCamera() {
  // The landing screen frames a fixed shot; it must not follow anything.
  if (sim.phase === 'landing') return

  const tx = toScreenX(sim.player.x, sim.player.y)
  const ty = toScreenY(sim.player.x, sim.player.y)

  if (!sim.camera.initialised) {
    sim.camera.x = tx
    sim.camera.y = ty
    sim.camera.initialised = true
    return
  }

  const dx = tx - sim.camera.x
  const dy = ty - sim.camera.y
  const dist = Math.hypot(dx, dy)
  if (dist < SIM.CAMERA_DEADZONE_PX * 0.25) return

  const k = sim.ui.reducedMotion ? 1 : SIM.CAMERA_LERP
  sim.camera.x += dx * k
  sim.camera.y += dy * k
}

export function setZoom(z: number) {
  sim.camera.zoom = Math.max(SIM.ZOOM_MIN, Math.min(SIM.ZOOM_MAX, z))
}

export function nudgeZoom(delta: number) {
  setZoom(sim.camera.zoom * (1 + delta))
}
