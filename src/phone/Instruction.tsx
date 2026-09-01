import { useUi } from '../sim/store'

export function Instruction() {
  const phase = useUi((s) => s.phase)
  const instruction = useUi((s) => s.instruction)
  const secondary = useUi((s) => s.secondary)
  const floorNm = useUi((s) => s.floorNm)
  const memoryCreated = useUi((s) => s.memoryCreated)

  let primary = instruction
  let sub = secondary
  let warn = false
  let icon: 'walk' | 'warn' | 'ok' = 'walk'

  if (phase === 'parked') {
    primary = 'Car parked on B3'
    sub = 'Just walk. Your phone is already remembering.'
  } else if (phase === 'offRoute') {
    primary = "You've stepped away from the remembered route"
    sub = 'Showing the full route instead.'
    warn = true
    icon = 'warn'
  } else if (phase === 'recovered') {
    primary = 'Back on your route'
    sub = 'Resuming guidance from where you are.'
    icon = 'ok'
  } else if (phase === 'remembering' || phase === 'floorTransition') {
    primary = 'Remembering your walk'
    sub = memoryCreated ? `On ${floorNm}. Memory is ready.` : `On ${floorNm}. No action needed.`
  }

  return (
    <div className={`instruction${warn ? ' warn' : ''}`} aria-live="polite">
      <span className="instruction-icon" aria-hidden="true">
        {icon === 'warn' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="14.2" r="1.15" fill="currentColor" />
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        ) : icon === 'ok' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="m5.5 10.3 3 3 6-6.6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 16V11h5V6h5V3"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="4" cy="16" r="1.9" fill="currentColor" />
          </svg>
        )}
      </span>
      <div className="instruction-text">
        <div className="primary">{primary}</div>
        {sub && <div className="secondary">{sub}</div>}
      </div>
    </div>
  )
}
