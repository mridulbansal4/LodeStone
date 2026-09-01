import { startDemo } from '../../sim/actions'

export function Overview() {
  return (
    <>
      {/* Editorial Hero Column */}
      <div className="mc-hero-section">
        <div className="mc-eyebrow">
          <span className="mc-eyebrow-dot" aria-hidden="true" />
          <span>INDOOR DEAD RECKONING • INTERACTIVE PROTOTYPE</span>
        </div>

        <h1 className="mc-hero-title">
          Your phone remembers <span className="mc-hero-em">the walk</span>, not the pin.
        </h1>

        <p className="mc-hero-deck">
          GPS dies under a concrete deck, so a dropped pin lands back at the ramp. Walk away from the car
          here and the phone records the route on its own, then guides you back through three floors
          of mall.
        </p>

        <div className="mc-action-group">
          <button className="mc-btn-primary" onClick={startDemo} autoFocus>
            <span>Start demo</span>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="mc-controls-pill">
            <span className="mc-controls-keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            <span className="mc-controls-label">to move</span>
            <span className="mc-controls-sep">·</span>
            <span className="mc-controls-keys">
              <kbd>E</kbd>
            </span>
            <span className="mc-controls-label">lifts</span>
            <span className="mc-controls-sep">·</span>
            <span className="mc-controls-keys">
              <kbd>F</kbd>
            </span>
            <span className="mc-controls-label">find car</span>
          </div>
        </div>
      </div>

      {/* Feature Constellation with Orbital Arc Connections & Satellite CTAs */}
      <div className="mc-constellation-section">
        {/* Decorative Orbital Trajectory SVG Arc */}
        <svg className="mc-orbital-arc" viewBox="0 0 600 220" fill="none" aria-hidden="true">
          <path
            d="M 40 180 Q 280 10 560 140"
            stroke="#F37338"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <circle cx="40" cy="180" r="3" fill="#F37338" />
          <circle cx="300" cy="85" r="3" fill="#F37338" />
          <circle cx="560" cy="140" r="3" fill="#F37338" />
        </svg>

        <div className="mc-cards-grid">
          {/* Feature Card 1: No GPS */}
          <div className="mc-portrait-card" onClick={startDemo} role="button" tabIndex={0}>
            <div className="mc-portrait-circle">
              <div className="mc-circle-graphic mc-graphic-gps">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#CF4500" strokeWidth="1.6" strokeDasharray="3 3" />
                  <circle cx="12" cy="12" r="4" fill="#CF4500" fillOpacity="0.18" stroke="#CF4500" strokeWidth="1.6" />
                  <path d="M12 3v3m0 12v3M3 12h3m12 0h3" stroke="#CF4500" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              {/* Docked Satellite CTA */}
              <div className="mc-satellite-cta" aria-label="Explore No GPS feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7h9m0 0L7.5 3M11.5 7l-4 4"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="mc-card-eyebrow">
              <span className="mc-card-dot" />
              <span>3 FLOORS UNDERGROUND</span>
            </div>
            <h3 className="mc-card-title">No GPS</h3>
            <p className="mc-card-desc">
              Inertial dead reckoning maps trajectory when satellite signals vanish.
            </p>
          </div>

          {/* Feature Card 2: No Beacons */}
          <div className="mc-portrait-card" onClick={startDemo} role="button" tabIndex={0}>
            <div className="mc-portrait-circle">
              <div className="mc-circle-graphic mc-graphic-beacons">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 18h16M7 14h10M10 10h4M12 6v1"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="5" r="2" fill="#F37338" />
                </svg>
              </div>
              {/* Docked Satellite CTA */}
              <div className="mc-satellite-cta" aria-label="Explore No Beacons feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7h9m0 0L7.5 3M11.5 7l-4 4"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="mc-card-eyebrow">
              <span className="mc-card-dot" />
              <span>ZERO VENUE HARDWARE</span>
            </div>
            <h3 className="mc-card-title">No Beacons</h3>
            <p className="mc-card-desc">
              Barometric elevation profiling tracks lift and ramp shifts autonomously.
            </p>
          </div>

          {/* Feature Card 3: No Camera */}
          <div className="mc-portrait-card" onClick={startDemo} role="button" tabIndex={0}>
            <div className="mc-portrait-circle">
              <div className="mc-circle-graphic mc-graphic-camera">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="4" width="14" height="16" rx="3" stroke="#141413" strokeWidth="1.6" />
                  <circle cx="12" cy="10" r="3" stroke="#CF4500" strokeWidth="1.6" />
                  <path d="M9 16h6" stroke="#141413" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              {/* Docked Satellite CTA */}
              <div className="mc-satellite-cta" aria-label="Explore No Camera feature">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7h9m0 0L7.5 3M11.5 7l-4 4"
                    stroke="#141413"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="mc-card-eyebrow">
              <span className="mc-card-dot" />
              <span>PASSIVE IN POCKET</span>
            </div>
            <h3 className="mc-card-title">No Camera</h3>
            <p className="mc-card-desc">
              The phone stays in your pocket without needing optical line of sight.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
