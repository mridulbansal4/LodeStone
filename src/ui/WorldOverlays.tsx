import { useUi, setUi } from '../sim/store'
import { sim, floorLabel, Floor } from '../sim/state'
import { startTransition } from '../sim/floors'
import { nudgeZoom } from '../world/camera'
import {
  LayersIcon,
  ZoomInIcon,
  ZoomOutIcon,
  KeyboardIcon,
  ElevatorIcon,
  StairsIcon,
  EscalatorIcon,
  SwapIcon,
} from './icons'

export function FloorBadge() {
  const lbl = useUi((s) => s.floorLbl)
  const nm = useUi((s) => s.floorNm)
  return (
    <div className="hud-chip floor-badge">
      <span className="hud-icon" aria-hidden="true">
        <LayersIcon size={17} />
      </span>
      <span className="floor-badge-text">
        <b>{lbl}</b>
        <span>{nm.replace(/^\S+\s/, '')}</span>
      </span>
    </div>
  )
}

export function ZoomControls() {
  const showLegend = useUi((s) => s.showLegend)
  return (
    <div className="hud-cluster">
      <button className="icon-btn" onClick={() => nudgeZoom(0.15)} aria-label="Zoom in">
        <ZoomInIcon />
      </button>
      <button className="icon-btn" onClick={() => nudgeZoom(-0.15)} aria-label="Zoom out">
        <ZoomOutIcon />
      </button>
      <button
        className={`icon-btn${showLegend ? ' is-on' : ''}`}
        onClick={() => setUi({ showLegend: !showLegend })}
        aria-label="Toggle controls"
        aria-pressed={showLegend}
      >
        <KeyboardIcon />
      </button>
    </div>
  )
}

function PadIcon({ type }: { type: string | null }) {
  if (type === 'STAIRS') return <StairsIcon size={17} />
  if (type === 'ESCALATOR') return <EscalatorIcon size={17} />
  return <ElevatorIcon size={17} />
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
      <span className="hud-icon" aria-hidden="true">
        <PadIcon type={padType} />
      </span>
      <span>Use {label}</span>
      <kbd>E</kbd>
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
              <b>{floorLabel(f)}</b>
              <kbd>{i + 1}</kbd>
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
      <div className="veil-inner">
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

export function SwapButton({ swapped, onToggle }: { swapped: boolean; onToggle: () => void }) {
  return (
    <button className="hud-chip swap-btn" onClick={onToggle}>
      <span className="hud-icon" aria-hidden="true">
        <SwapIcon />
      </span>
      {swapped ? 'Show phone' : 'Full map'}
    </button>
  )
}

export function KeyLegend() {
  const show = useUi((s) => s.showLegend)
  if (!show) return null
  const rows: [string[], string][] = [
    [['W', 'A', 'S', 'D'], 'move'],
    [['Shift'], 'sprint'],
    [['E'], 'lift / stairs'],
    [['F'], 'find my car'],
    [['G'], 'start guidance'],
    [['R'], 'restart'],
    [['+', '−'], 'zoom'],
  ]
  return (
    <div className="key-legend">
      {rows.map(([keys, label]) => (
        <span key={label}>
          {keys.map((k) => (
            <kbd key={k}>{k}</kbd>
          ))}
          {label}
        </span>
      ))}
    </div>
  )
}
