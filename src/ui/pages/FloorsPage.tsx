import { startDemo } from '../../sim/actions'

export function FloorsPage() {
  return (
    <div className="mc-page-container">
      <div className="mc-hero-section">
        <div className="mc-eyebrow">
          <span className="mc-eyebrow-dot" aria-hidden="true" />
          <span>MULTI-FLOOR LOCALIZATION</span>
        </div>
        <h1 className="mc-hero-title">
          One walk. Three floors. <br/><span className="mc-hero-em">One remembered route.</span>
        </h1>
        <p className="mc-hero-deck">
          Track a complete real-world journey across multiple levels, ramps, and elevators.
        </p>
      </div>

      {/* Visual Centerpiece: Isometric Deck */}
      <div className="mc-isometric-container">
        <div className="mc-isometric-deck">
          {/* L1 Mall */}
          <div className="mc-iso-layer mc-layer-l1">
            <span className="mc-iso-label">Ground / Mall</span>
            <svg viewBox="0 0 200 100" className="mc-iso-floor">
              <polygon points="100,10 190,50 100,90 10,50" fill="rgba(255,255,255,0.8)" stroke="#d1d5db" strokeWidth="1" />
              <path d="M100,50 L140,65" fill="none" stroke="#F37338" strokeWidth="2" strokeDasharray="2 2" className="mc-iso-path" />
              <circle cx="140" cy="65" r="4" fill="#CF4500" />
            </svg>
            <div className="mc-elevator-shaft" />
          </div>
          
          {/* B1 Parking */}
          <div className="mc-iso-layer mc-layer-b1">
            <span className="mc-iso-label">Basement 1</span>
            <svg viewBox="0 0 200 100" className="mc-iso-floor">
              <polygon points="100,10 190,50 100,90 10,50" fill="rgba(243, 240, 238, 0.9)" stroke="#d1d5db" strokeWidth="1" />
            </svg>
            <div className="mc-elevator-shaft" />
          </div>

          {/* B2 Parking */}
          <div className="mc-iso-layer mc-layer-b2">
            <span className="mc-iso-label">Basement 2</span>
            <svg viewBox="0 0 200 100" className="mc-iso-floor">
              <polygon points="100,10 190,50 100,90 10,50" fill="rgba(243, 240, 238, 0.9)" stroke="#d1d5db" strokeWidth="1" />
            </svg>
            <div className="mc-elevator-shaft" />
          </div>

          {/* B3 Parking */}
          <div className="mc-iso-layer mc-layer-b3">
            <span className="mc-iso-label">Basement 3</span>
            <svg viewBox="0 0 200 100" className="mc-iso-floor">
              <polygon points="100,10 190,50 100,90 10,50" fill="rgba(243, 240, 238, 0.9)" stroke="#d1d5db" strokeWidth="1" />
              <path d="M40,65 L100,50" fill="none" stroke="#F37338" strokeWidth="2" strokeDasharray="2 2" className="mc-iso-path" />
              <rect x="35" y="60" width="10" height="10" fill="#141413" transform="rotate(30 40 65)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Scroll-based Sequence */}
      <div className="mc-story-sequence">
        <div className="mc-story-step">
          <div className="mc-step-number">01</div>
          <div className="mc-step-content">
            <h3>Park</h3>
            <p>The system contextually infers the transition from driving to walking, anchoring the start of the trace.</p>
          </div>
        </div>
        
        <div className="mc-story-step">
          <div className="mc-step-number">02</div>
          <div className="mc-step-content">
            <h3>Walk</h3>
            <p>Your route is reconstructed passively in the background from inertial sensor data.</p>
          </div>
        </div>
        
        <div className="mc-story-step">
          <div className="mc-step-number">03</div>
          <div className="mc-step-content">
            <h3>Change Floor</h3>
            <p>Floor transitions via elevator, stairs, or escalator are inferred from barometric and motion signals, assigned a probabilistic confidence score.</p>
          </div>
        </div>
        
        <div className="mc-story-step">
          <div className="mc-step-number">04</div>
          <div className="mc-step-content">
            <h3>Return</h3>
            <p>Open LodeStone. The system matches your live sensor sequence against the stored spatial and magnetic fingerprint.</p>
          </div>
        </div>
        
        <div className="mc-story-step">
          <div className="mc-step-number">05</div>
          <div className="mc-step-content">
            <h3>Find the car</h3>
            <p>The route animates backward, guiding you safely to your original parking spot.</p>
          </div>
        </div>
      </div>

      <div className="mc-page-footer">
        <p className="mc-footer-tagline">Experience it firsthand.</p>
        <button className="mc-btn-primary" onClick={startDemo}>
          <span>Start Interactive Demo</span>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
