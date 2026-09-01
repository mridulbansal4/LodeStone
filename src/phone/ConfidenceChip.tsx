import { useUi } from '../sim/store'

/**
 * Confidence never relies on colour alone: the band is spelled out as a word
 * and carries its own glyph, so it survives colour-blindness and a bad
 * projector equally.
 */
export function ConfidenceChip() {
  const band = useUi((s) => s.confBand)
  const cls = band.toLowerCase()
  const glyph = band === 'High' ? '◉' : band === 'Medium' ? '◎' : '○'
  return (
    <div className={`conf-chip ${cls}`} title="Simulated confidence: derived from distance to the route">
      <span aria-hidden="true">{glyph}</span>
      {band} confidence
    </div>
  )
}
