import { startDemo } from '../sim/actions'
import { useUi } from '../sim/store'

/**
 * The landing page. Left-aligned editorial column over the live B3 parking
 * deck, so the first thing a judge sees is the problem the product solves
 * rather than a decorative gradient.
 */
export function Landing() {
  const phase = useUi((s) => s.phase)
  if (phase !== 'landing') return null

  return (
    <div className="landing">
      <div className="landing-col">
        <div className="masthead">
          <span className="mark" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 12.5V8.5h4v-4h4V2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="3.5" cy="12.5" r="2.1" fill="currentColor" />
            </svg>
          </span>
          <span className="name">Lodestone</span>
          <span className="rule" aria-hidden="true" />
          <span className="kind">Interactive prototype</span>
        </div>

        <h1>
          Your phone remembers <em>the walk</em>, not the pin.
        </h1>

        <p className="deck">
          GPS dies under a concrete deck, so a dropped pin lands back at the ramp. Walk away from the car
          here and the phone records the route on its own &mdash; then guides you back through three floors
          of mall.
        </p>

        <div className="actions">
          <button className="start" onClick={startDemo} autoFocus>
            Start demo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="controls">
            <b>W A S D</b> to move · <b>E</b> for lifts · <b>F</b> to find your car
          </span>
        </div>

        <ul className="claims">
          <li>
            <b>No GPS</b>
            <span>Works three floors underground</span>
          </li>
          <li>
            <b>No beacons</b>
            <span>Nothing installed in the venue</span>
          </li>
          <li>
            <b>No camera</b>
            <span>The phone stays in your pocket</span>
          </li>
        </ul>
      </div>

      <p className="disclosure">
        <i aria-hidden="true" />
        Simulation. Every figure this prototype shows is derived from the game state, not from a sensor.
      </p>
    </div>
  )
}
