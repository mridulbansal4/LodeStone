import { useUi } from '../../sim/store'
import { beginGuidance, restart } from '../../sim/actions'

/** State 8 - Route Overview. The screenshot moment. */
export function RouteOverview() {
  const phase = useUi((s) => s.phase)
  const summary = useUi((s) => s.summary)
  const distance = useUi((s) => s.distance)
  const routeLen = useUi((s) => s.routeLen)
  const floorEvents = useUi((s) => s.floorEventCount)
  if (phase !== 'routeOverview') return null

  return (
    <div className="phone-sheet">
      <div className="card-eyebrow">Route remembered</div>
      <h3>Find My Car</h3>
      <p>{summary || 'Your recorded walk is ready.'}</p>
      <div className="summary-grid">
        <div>
          <div className="v">{distance} m</div>
          <div className="k">walked</div>
        </div>
        <div>
          <div className="v">{routeLen}</div>
          <div className="k">route points</div>
        </div>
        <div>
          <div className="v">{floorEvents}</div>
          <div className="k">floor events</div>
        </div>
        <div>
          <div className="v">B3</div>
          <div className="k">car level</div>
        </div>
      </div>
      <p className="footnote">Reconstructed from this simulated walk. No GPS, no beacons, no camera.</p>
      <button onClick={beginGuidance}>Start guidance</button>
    </div>
  )
}

/** State 12 - Car Found. */
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
        ✓
      </div>
      <div className="card-eyebrow">Car found</div>
      <h3>You&rsquo;re back at the car</h3>
      <p>Arrived in the recorded parking area on B3.</p>
      <div className="summary-grid">
        <div>
          <div className="v">{distance} m</div>
          <div className="k">total walk</div>
        </div>
        <div>
          <div className="v">{steps.toLocaleString()}</div>
          <div className="k">steps (sim)</div>
        </div>
        <div>
          <div className="v">{floorEvents}</div>
          <div className="k">floor events</div>
        </div>
        <div>
          <div className="v">
            {mins}:{String(secs).padStart(2, '0')}
          </div>
          <div className="k">time back</div>
        </div>
      </div>
      <p className="footnote">
        Your route was remembered from motion alone. No GPS. No beacons. No camera.
      </p>
      <div className="overlay-actions">
        <button onClick={restart}>Replay</button>
      </div>
    </div>
  )
}
