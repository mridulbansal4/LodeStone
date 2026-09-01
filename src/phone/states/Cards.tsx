import { useUi } from '../../sim/store'

/** State 5 - Floor Transition. Logged as a floor EVENT, not a floor reading. */
export function FloorEventCard() {
  const active = useUi((s) => s.transitionActive)
  const label = useUi((s) => s.transitionLbl)
  if (!active) return null
  return (
    <div className="snackbar">
      <span className="snackbar-icon" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
          <path
            d="M5 7 5 15M5 7 2.6 9.4M5 7l2.4 2.4M13 11V3m0 8 2.4-2.4M13 11l-2.4-2.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <div className="snackbar-title">{label}</div>
        <div className="snackbar-sub">Floor event recorded</div>
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
    <div className="memory-card">
      <div className="sheet-overline">Memory created</div>
      <div className="memory-card-body">{summary}</div>
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
        <div className="label">Recalling your walk</div>
      </div>
    </div>
  )
}
