import { useUi } from '../../sim/store'
import { beginGuidance, restart } from '../../sim/actions'

/**
 * State 8 - Route Overview. A bottom sheet rather than a full cover: the
 * exploded-floors map above it is the point of the state, so it stays visible.
 */
export function RouteOverviewSheet() {
  const summary = useUi((s) => s.summary)
  const distance = useUi((s) => s.distance)
  const routeLen = useUi((s) => s.routeLen)
  const floorEvents = useUi((s) => s.floorEventCount)

  return (
    <div className="bottom-sheet phone-sheet">
      <span className="sheet-handle" aria-hidden="true" />
      <div className="sheet-overline">Route remembered</div>
      <h3 className="sheet-title">Find my car</h3>
      <p className="sheet-body">{summary || 'Your recorded walk is ready.'}</p>

      <div className="metric-grid">
        <div className="metric">
          <div className="v">{distance} m</div>
          <div className="k">Walked</div>
        </div>
        <div className="metric">
          <div className="v">{routeLen}</div>
          <div className="k">Route points</div>
        </div>
        <div className="metric">
          <div className="v">{floorEvents}</div>
          <div className="k">Floor events</div>
        </div>
        <div className="metric">
          <div className="v">B3</div>
          <div className="k">Car level</div>
        </div>
      </div>

      <p className="sheet-footnote">Reconstructed from this simulated walk. No GPS, no beacons, no camera.</p>
      <button className="btn-filled" onClick={beginGuidance}>
        Start guidance
      </button>
    </div>
  )
}

/** State 12 - Car Found. The climax, so it takes the whole screen. */
export function CarFound() {
  const phase = useUi((s) => s.phase)
  const distance = useUi((s) => s.distance)
  const steps = useUi((s) => s.steps)
  const floorEvents = useUi((s) => s.floorEventCount)
  const back = useUi((s) => s.returnDuration)
  if (phase !== 'carFound') return null

  const mins = Math.floor(back / 60)
  const secs = back % 60

  return (
    <div className="phone-overlay">
      <div className="found-icon" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12.5 9.5 18 20 6.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="sheet-overline">Car found</div>
      <h3 className="overlay-title">You&rsquo;re back at the car</h3>
      <p className="sheet-body">Arrived in the recorded parking area on B3.</p>

      <div className="metric-grid">
        <div className="metric">
          <div className="v">{distance} m</div>
          <div className="k">Total walk</div>
        </div>
        <div className="metric">
          <div className="v">{steps.toLocaleString()}</div>
          <div className="k">Steps (sim)</div>
        </div>
        <div className="metric">
          <div className="v">{floorEvents}</div>
          <div className="k">Floor events</div>
        </div>
        <div className="metric">
          <div className="v">
            {mins}:{String(secs).padStart(2, '0')}
          </div>
          <div className="k">Time back</div>
        </div>
      </div>

      <p className="sheet-footnote">
        Your route was remembered from motion alone. No GPS. No beacons. No camera.
      </p>
      <button className="btn-filled" onClick={restart}>
        Replay
      </button>
    </div>
  )
}
