import { useUi } from '../sim/store'

/**
 * Every figure here is DERIVED from a position the engine already knows.
 * The SIM superscript is the honesty marker required by the PRD - it must not
 * be removed to make the UI look tidier.
 */
export function StatStrip() {
  // Primitive selectors: each is Object.is-compared, so a stat that has not
  // moved costs no render.
  const distance = useUi((s) => s.distance)
  const steps = useUi((s) => s.steps)
  const turns = useUi((s) => s.turns)
  return (
    <div className="stat-strip">
      <Stat v={`${distance} m`} k="distance" />
      <Stat v={steps.toLocaleString()} k="steps" />
      <Stat v={String(turns)} k="turns" />
    </div>
  )
}

function Stat({ v, k }: { v: string; k: string }) {
  return (
    <div className="stat">
      <div className="v">{v}</div>
      <div className="k">
        {k}
        <sup title="Simulated value, not a sensor reading">SIM</sup>
      </div>
    </div>
  )
}
