import { useUi } from '../sim/store'

/**
 * Confidence never relies on colour alone: the band is spelled out as a word
 * and carries its own glyph, so it survives colour-blindness and a bad
 * projector equally.
 */
export function ConfidenceChip() {
  const band = useUi((s) => s.confBand)
  const cls = band.toLowerCase()
  const bars = band === 'High' ? 3 : band === 'Medium' ? 2 : 1

  return (
    <div className={`conf-chip ${cls}`} title="Simulated confidence: derived from distance to the route">
      <svg width="13" height="11" viewBox="0 0 14 12" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={i * 5}
            y={8 - i * 3.4}
            width="3.4"
            height={4 + i * 3.4}
            rx="1.2"
            fill="currentColor"
            opacity={i < bars ? 1 : 0.28}
          />
        ))}
      </svg>
      {band}
    </div>
  )
}
