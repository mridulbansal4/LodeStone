import { useUi } from '../sim/store'

/**
 * Every figure here is DERIVED from a position the engine already knows.
 * The SIM marker is the honesty requirement from the PRD - it must not be
 * removed to make the UI look tidier.
 */
export function StatStrip() {
  // Primitive selectors: each is Object.is-compared, so a stat that has not
  // moved costs no render.
  const distance = useUi((s) => s.distance)
  const steps = useUi((s) => s.steps)
  const turns = useUi((s) => s.turns)

  return (
    <div className="stat-strip">
      <Stat v={`${distance}`} unit="m" k="Distance" />
      <Stat v={steps.toLocaleString()} k="Steps" />
      <Stat v={String(turns)} k="Turns" />
    </div>
  )
}

function Stat({ v, unit, k }: { v: string; unit?: string; k: string }) {
  return (
    <div className="stat">
      <div className="v">
        {v}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="k">
        {k}
        <em title="Simulated value, not a sensor reading">sim</em>
      </div>
    </div>
  )
}
