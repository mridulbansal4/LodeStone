import { setUi } from '../../sim/store'

export function PdrPage() {
  return (
    <div className="mc-page-container">
      <div className="mc-hero-section">
        <div className="mc-eyebrow">
          <span className="mc-eyebrow-dot" aria-hidden="true" />
          <span>INERTIAL PEDESTRIAN DEAD RECKONING</span>
        </div>
        <h1 className="mc-hero-title">
          The phone doesn't need to see the path.<br/> <span className="mc-hero-em">It can feel it.</span>
        </h1>
        <p className="mc-hero-deck">
          LodeStone reconstructs your movement from onboard motion sensors while the phone remains in your pocket. No GPS, no cameras, no scanning.
        </p>
      </div>
      
      {/* PDR Pipeline Infographic */}
      <div className="mc-insight-section mc-pipeline-section">
        <div className="mc-pipeline-graphic">
          <div className="mc-pipeline-node">
            <div className="mc-pipeline-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div className="mc-pipeline-text">
              <h4>Accelerometer</h4>
            </div>
          </div>
          <div className="mc-pipeline-arrow">&darr;</div>
          
          <div className="mc-pipeline-node">
            <div className="mc-pipeline-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
            </div>
            <div className="mc-pipeline-text">
              <h4>Step Detection</h4>
            </div>
          </div>
          <div className="mc-pipeline-arrow">&darr;</div>
          
          <div className="mc-pipeline-node">
            <div className="mc-pipeline-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            </div>
            <div className="mc-pipeline-text">
              <h4>Stride Estimation</h4>
            </div>
          </div>
          <div className="mc-pipeline-arrow">&darr;</div>
          
          <div className="mc-pipeline-node">
            <div className="mc-pipeline-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            </div>
            <div className="mc-pipeline-text">
              <h4>Relative Heading</h4>
            </div>
          </div>
          <div className="mc-pipeline-arrow">&darr;</div>
          
          <div className="mc-pipeline-node highlight">
            <div className="mc-pipeline-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            </div>
            <div className="mc-pipeline-text">
              <h4>Route Reconstruction</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Correction Insight */}
      <div className="mc-insight-section mc-grid-correction">
        <h2 className="mc-section-title">We don't need absolute north.</h2>
        <p className="mc-section-desc">
          We care about relative movement from the parking location, not your absolute GPS coordinates.
          The garage already has a geometry. We use it.
        </p>
        
        <div className="mc-graphic-panel">
          <div className="mc-grid-viz">
            <div className="mc-viz-col">
              <h5>Raw Sensor Path</h5>
              <svg viewBox="0 0 100 100" className="mc-noisy-path">
                 <path d="M10 90 L12 85 L9 75 L15 70 L13 60 L18 55 L20 40 L30 38 L35 42 L50 35 L60 38 L75 30 L85 35 L90 20" fill="none" stroke="#6d7480" strokeWidth="2" strokeLinejoin="round"/>
                 <circle cx="10" cy="90" r="3" fill="#CF4500" />
                 <circle cx="90" cy="20" r="3" fill="#6d7480" />
              </svg>
            </div>
            <div className="mc-viz-arrow">&rarr;</div>
            <div className="mc-viz-col">
              <h5>Grid-Corrected Path</h5>
              <svg viewBox="0 0 100 100" className="mc-clean-path">
                 <path d="M10 90 L10 40 L90 40 L90 20" fill="none" stroke="#F37338" strokeWidth="3" strokeLinejoin="miter"/>
                 <circle cx="10" cy="90" r="3" fill="#CF4500" />
                 <circle cx="90" cy="20" r="3" fill="#141413" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pocket Positioning */}
      <div className="mc-insight-section mc-pocket-positioning">
        <h2 className="mc-section-title">No pointing. No scanning.<br/>Just walk.</h2>
        <p className="mc-section-desc">
          There's no need to hold the phone in front of you. By fusing accelerometer and gyroscope data dynamically, the system compensates for how the phone bounces and rotates inside your pocket or bag.
        </p>
      </div>

      {/* Magnetic Fingerprint Insight */}
      <div className="mc-insight-section mc-magnetic-fingerprint">
        <h2 className="mc-section-title">The magnetometer is a terrible compass.<br/><span className="mc-hero-em">That's exactly why we use it differently.</span></h2>
        <p className="mc-section-desc">
          Steel structures, reinforcement, and vehicles distort the local magnetic field. That makes the magnetometer unreliable as a traditional compass. But those distortions can act as a spatial fingerprint.
        </p>

        <div className="mc-dtw-visualization">
          <div className="mc-dtw-row">
            <span className="mc-dtw-label">STORED ROUTE</span>
            <svg viewBox="0 0 400 40" className="mc-dtw-wave">
              <path d="M 0 20 Q 20 5, 40 20 T 80 20 Q 90 35, 100 20 T 140 20 Q 160 0, 180 20 T 220 20 Q 230 30, 240 20 T 280 20 Q 300 5, 320 20 T 360 20 Q 380 35, 400 20" fill="none" stroke="#CF4500" strokeWidth="2"/>
            </svg>
          </div>
          
          <div className="mc-dtw-alignments">
            <svg viewBox="0 0 400 30" preserveAspectRatio="none">
              {/* Dynamic Time Warping alignment lines */}
              <line x1="40" y1="0" x2="60" y2="30" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="100" y1="0" x2="110" y2="30" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="180" y1="0" x2="200" y2="30" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="240" y1="0" x2="240" y2="30" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="320" y1="0" x2="340" y2="30" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>

          <div className="mc-dtw-row">
            <span className="mc-dtw-label">RETURN WALK</span>
            <svg viewBox="0 0 400 40" className="mc-dtw-wave return">
              <path d="M 0 20 Q 30 5, 60 20 T 90 20 Q 100 35, 110 20 T 150 20 Q 175 0, 200 20 T 230 20 Q 235 30, 240 20 T 290 20 Q 315 5, 340 20 T 370 20 Q 385 35, 400 20" fill="none" stroke="#141413" strokeWidth="2"/>
            </svg>
          </div>
          
          <div className="mc-dtw-caption">
            <strong>Dynamic Time Warping (DTW)</strong> alignment. You don't have to walk at exactly the same speed to recognize the same path.
          </div>
        </div>
      </div>

      <div className="mc-page-footer">
        <p className="mc-footer-tagline">Your phone remembers the walk.</p>
        <button className="mc-btn-primary" onClick={() => setUi({ route: 'floors' })}>
          <span>Next: Multi-Floor Tracking</span>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
