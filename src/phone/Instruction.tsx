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

  if (phase === 'parked') {
    primary = 'Car parked on B3'
    sub = 'Just walk. Your phone is already remembering.'
  } else if (phase === 'offRoute') {
    primary = "You've stepped away from the remembered route"
    sub = 'Showing the full route instead.'
    warn = true
  } else if (phase === 'recovered') {
    primary = 'Back on your route'
    sub = 'Resuming guidance from where you are.'
  } else if (phase === 'remembering' || phase === 'floorTransition') {
    primary = 'Remembering your walk'
    sub = memoryCreated ? `On ${floorNm}. Memory is ready.` : `On ${floorNm}. No action needed.`
  }

  return (
    <div className={`instruction${warn ? ' warn' : ''}`} aria-live="polite">
      <div className="primary">{primary}</div>
      {sub && <div className="secondary">{sub}</div>}
    </div>
  )
}
