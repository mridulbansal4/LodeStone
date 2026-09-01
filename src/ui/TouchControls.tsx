import { useRef, useState } from 'react'
import { sim } from '../sim/state'
import { requestTransition } from '../sim/floors'
import { findMyCar, restart } from '../sim/actions'
import { useUi } from '../sim/store'

const RADIUS = 60
const DEAD = 0.18

/** Touch fallback. Targets are >= 44px, per the accessibility rule in the PRD. */
export function TouchControls() {
  const padRef = useRef<HTMLDivElement>(null)
  const [nub, setNub] = useState({ x: RADIUS, y: RADIUS })
  const idRef = useRef<number | null>(null)
  const canUse = useUi((s) => s.canUse)
  const phase = useUi((s) => s.phase)

  const apply = (clientX: number, clientY: number) => {
    const el = padRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    let dx = (clientX - (r.left + r.width / 2)) / RADIUS
    let dy = (clientY - (r.top + r.height / 2)) / RADIUS
    const m = Math.hypot(dx, dy)
    if (m > 1) {
      dx /= m
      dy /= m
    }
    const mag = Math.hypot(dx, dy)
    sim.input.joy.x = mag < DEAD ? 0 : dx
    sim.input.joy.y = mag < DEAD ? 0 : dy
    setNub({ x: RADIUS + dx * RADIUS, y: RADIUS + dy * RADIUS })
  }

  const release = () => {
    idRef.current = null
    sim.input.joy.x = 0
    sim.input.joy.y = 0
    setNub({ x: RADIUS, y: RADIUS })
  }

  return (
    <div className="touch-layer">
      <div
        ref={padRef}
        className="joystick"
        role="application"
        aria-label="Movement joystick"
        onPointerDown={(e) => {
          idRef.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          apply(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (idRef.current === e.pointerId) apply(e.clientX, e.clientY)
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="nub" style={{ left: nub.x, top: nub.y }} />
      </div>

      <div className="touch-buttons">
        {canUse && <button onClick={requestTransition}>Use</button>}
        {phase !== 'carFound' && (
          <button className="primary" onClick={findMyCar}>
            Find My Car
          </button>
        )}
        <button onClick={restart}>Restart</button>
      </div>
    </div>
  )
}
