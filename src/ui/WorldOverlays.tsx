import { useUi, setUi } from '../sim/store'
import { sim, floorLabel, Floor } from '../sim/state'
import { startTransition } from '../sim/floors'
import { nudgeZoom } from '../world/camera'

export function FloorBadge() {
  const lbl = useUi((s) => s.floorLbl)
  const nm = useUi((s) => s.floorNm)
  return (
    <div className="floor-badge">
      <b>{lbl}</b>
      <span>{nm.replace(/^\S+\s/, '')}</span>
    </div>
  )
}

export function ZoomControls() {
  const showLegend = useUi((s) => s.showLegend)
  return (
    <div className="zoom-controls">
      <button onClick={() => nudgeZoom(0.15)} aria-label="Zoom in">
        +
      </button>
      <button onClick={() => nudgeZoom(-0.15)} aria-label="Zoom out">
        −
      </button>
      <button
        className="icon-btn"
        onClick={() => setUi({ showLegend: !showLegend })}
        aria-label="Toggle controls"
      >
        ?
      </button>
    </div>
  )
}

export function UsePrompt() {
  const canUse = useUi((s) => s.canUse)
  const padType = useUi((s) => s.padType)
  const picker = useUi((s) => s.floorPicker)
  const transitionActive = useUi((s) => s.transitionActive)
  if (!canUse || picker || transitionActive) return null
  const label = padType === 'ELEVATOR' ? 'the lift' : padType === 'STAIRS' ? 'the stairs' : 'the escalator'
  return (
    <div className="use-prompt">
      <kbd>E</kbd>
      <span>Use {label}</span>
    </div>
  )
}

export function FloorPicker() {
  const picker = useUi((s) => s.floorPicker)
  const targets = useUi((s) => s.padTargets)
  if (!picker) return null
  return (
    <div className="floor-picker" onClick={() => (sim.ui.floorPicker = false)}>
      <div className="floor-picker-card" onClick={(e) => e.stopPropagation()}>
        <h4>Which floor?</h4>
        <p>Press a number key, or tap</p>
        <div className="row">
          {targets.map((f: Floor, i: number) => (
            <button key={f} className="floor-btn" onClick={() => startTransition(f)}>
              <kbd>{i + 1}</kbd> {floorLabel(f)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TransitionVeil() {
  const active = useUi((s) => s.transitionActive)
  const lbl = useUi((s) => s.transitionLbl)
  const floorLbl = useUi((s) => s.floorLbl)
  if (!active) return null
  return (
    <div className="transition-veil">
      <div style={{ textAlign: 'center' }}>
        <div className="ticker">{floorLbl}</div>
        <div className="sub">{lbl}</div>
      </div>
    </div>
  )
}

export function WorldToast() {
  const toast = useUi((s) => s.toast)
  if (!toast) return null
  return <div className="world-toast">{toast}</div>
}

export function KeyLegend() {
  const show = useUi((s) => s.showLegend)
  if (!show) return null
  return (
    <div className="key-legend">
      <span>
        <kbd>W</kbd>
        <kbd>A</kbd>
        <kbd>S</kbd>
        <kbd>D</kbd> move
      </span>
      <span>
        <kbd>Shift</kbd> walk slowly
      </span>
      <span>
        <kbd>E</kbd> lift / stairs
      </span>
      <span>
        <kbd>F</kbd> find my car
      </span>
      <span>
        <kbd>G</kbd> start guidance
      </span>
      <span>
        <kbd>R</kbd> restart
      </span>
      <span>
        <kbd>+</kbd>
        <kbd>−</kbd> zoom
      </span>
    </div>
  )
}
