import { useUi } from '../../sim/store'

/** State 5 - Floor Transition. Logged as a floor EVENT, not a floor reading. */
export function FloorEventCard() {
  const active = useUi((s) => s.transitionActive)
  const label = useUi((s) => s.transitionLbl)
  if (!active) return null
  const icon = label.startsWith('Elevator') ? '⇅' : label.startsWith('Stairs') ? '⇈' : '⇗'
  return (
    <div className="card event">
      <div className="icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="t">{label}</div>
        <div className="s">Floor event recorded</div>
      </div>
    </div>
  )
}

/**
 * State 6 - Memory Created. A presentation event only: the route object has
 * been building continuously since the first step.
 */
export function MemoryCard() {
  const open = useUi((s) => s.memoryCardOpen)
  const summary = useUi((s) => s.summary)
  const phase = useUi((s) => s.phase)
  if (!open || !summary) return null
  if (phase === 'findMyCar' || phase === 'routeOverview' || phase === 'returnNav') return null
  return (
    <div className="card">
      <div className="card-eyebrow">Memory created</div>
      <div className="card-body">{summary}</div>
    </div>
  )
}

export function ToastLine() {
  const toast = useUi((s) => s.toast)
  if (!toast) return null
  return (
    <div className="toast-line" role="status">
      {toast}
    </div>
  )
}

/** State 7 - the Find My Car morph. */
export function Morph() {
  const phase = useUi((s) => s.phase)
  if (phase !== 'findMyCar') return null
  return (
    <div className="morph">
      <div>
        <div className="spin" aria-hidden="true" />
        <div className="label">Recalling your walk…</div>
      </div>
    </div>
  )
}
