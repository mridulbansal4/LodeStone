import { useEffect, useRef, useState, ReactNode } from 'react'
import { setUi } from '../../sim/store'

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function ScrollSection({ children, className = '' }: { children: ReactNode, className?: string }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div ref={ref} className={`mc-scroll-section ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function PdrPage() {
  return (
    <div className="mc-page-container pdr-story">
      {/* PAGE HERO */}
      <div className="mc-hero-section compact-hero">
        <div className="mc-eyebrow">
          <span className="mc-eyebrow-dot" aria-hidden="true" />
          <span>INERTIAL PEDESTRIAN DEAD RECKONING</span>
        </div>
        <h1 className="mc-hero-title">
          Your phone can feel <span className="mc-hero-em">the path.</span>
        </h1>
        <p className="mc-hero-deck">
          Park Trace reconstructs your walking route using onboard motion sensors while the phone remains in your pocket. No GPS. No camera. No special handling.
        </p>
      </div>

      {/* WE DON'T NEED TO KNOW NORTH (combining hero visual and relative heading concept) */}
      <ScrollSection className="mc-insight-section compact-section">
        <div className="mc-side-by-side">
          <div className="mc-sbs-text">
            <h2 className="mc-section-title">We don't need to know north.</h2>
            <p className="mc-section-desc">
              Park Trace doesn't need absolute GPS coordinates. By using the Game Rotation Vector, it primarily tracks your relative movement from the starting point.
            </p>
          </div>
          <div className="mc-sbs-visual compact-visual">
            <svg viewBox="0 0 160 100" className="compact-relative-svg" style={{width: '100%', maxWidth: '200px'}}>
              <circle cx="40" cy="80" r="5" fill="#141413" />
              <text x="52" y="84" fontSize="10" fill="#6d7480" fontWeight="600">START</text>
              <path className="relative-path" d="M 40 80 L 40 30 L 120 30" fill="none" stroke="#F37338" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle className="relative-end-dot" cx="120" cy="30" r="5" fill="#CF4500" />
            </svg>
          </div>
        </div>
      </ScrollSection>

      {/* STEPS BECOME A PATH */}
      <ScrollSection className="mc-insight-section compact-section">
        <h2 className="mc-section-title">Steps become a path.</h2>
        <p className="mc-section-desc">
          Using just the accelerometer, we detect the impact of each step and estimate your stride length.
        </p>
        <div className="mc-graphic-panel compact-panel">
          <div className="horizontal-flow-diagram">
            <div className="hf-node accel">
              <span>ACCELEROMETER</span>
            </div>
            <div className="hf-line"><div className="hf-dot d1" /></div>
            <div className="hf-node step">
              <span>STEP</span>
            </div>
            <div className="hf-line"><div className="hf-dot d2" /></div>
            <div className="hf-node stride">
              <span>STRIDE</span>
            </div>
            <div className="hf-line"><div className="hf-dot d3" /></div>
            <div className="hf-node heading">
              <span>HEADING</span>
            </div>
            <div className="hf-line"><div className="hf-dot d4" /></div>
            <div className="hf-node pdr highlight">
              <span>PDR</span>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* GARAGE GEOMETRY */}
      <ScrollSection className="mc-insight-section compact-section">
        <h2 className="mc-section-title">The garage has a geometry.</h2>
        <p className="mc-section-desc">
          Parking garages are generally structured around corridors and 90-degree turns. We snap the raw, slightly noisy sensor path to this grid.
        </p>
        <div className="mc-graphic-panel compact-panel">
          <div className="mc-grid-viz-compact">
            <div className="mc-viz-col">
              <h5>Raw Path</h5>
              <svg viewBox="0 0 100 80" className="mc-noisy-path-small">
                 <path className="raw-path-anim" d="M10 70 L12 65 L9 55 L15 50 L13 40 L18 35 L20 20 L30 18 L35 22 L50 15 L60 18 L75 10 L85 15 L90 5" fill="none" stroke="#6d7480" strokeWidth="1.5" strokeLinejoin="round"/>
                 <circle cx="10" cy="70" r="2.5" fill="#CF4500" />
                 <circle cx="90" cy="5" r="2.5" fill="#6d7480" />
              </svg>
            </div>
            <div className="mc-viz-arrow">&rarr;</div>
            <div className="mc-viz-col">
              <h5>Grid-Corrected</h5>
              <svg viewBox="0 0 100 80" className="mc-clean-path-small">
                 <path className="grid-path-anim" d="M10 70 L10 20 L90 20 L90 5" fill="none" stroke="#F37338" strokeWidth="2.5" strokeLinejoin="miter"/>
                 <circle cx="10" cy="70" r="2.5" fill="#CF4500" />
                 <circle className="grid-dot-anim" cx="90" cy="5" r="2.5" fill="#141413" />
              </svg>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* MAGNETIC FINGERPRINT & DTW */}
      <ScrollSection className="mc-insight-section compact-section">
        <h2 className="mc-section-title">A place leaves a magnetic signature.</h2>
        <p className="mc-section-desc">
          Steel structures distort the magnetic field, providing a spatial fingerprint. Dynamic Time Warping aligns your return trace to this stored route, even if you walk at a different speed.
        </p>
        <div className="mc-graphic-panel compact-panel fingerprint-dtw-panel">
           <div className="fingerprint-label">GARAGE PATH</div>
           <svg viewBox="0 0 300 15" className="fingerprint-path-svg">
              <line className="fp-line" x1="0" y1="8" x2="300" y2="8" stroke="#141413" strokeWidth="1.5" />
              <circle className="fp-dot" cx="0" cy="8" r="3" fill="#CF4500" />
              <circle className="fp-dot" cx="75" cy="8" r="3" fill="#CF4500" />
              <circle className="fp-dot" cx="150" cy="8" r="3" fill="#CF4500" />
              <circle className="fp-dot" cx="225" cy="8" r="3" fill="#CF4500" />
              <circle className="fp-dot" cx="300" cy="8" r="3" fill="#CF4500" />
           </svg>
           <div className="fingerprint-label fp-mt">OUTBOUND SIGNATURE</div>
           <svg viewBox="0 0 300 24" className="fingerprint-wave-svg">
              <path className="dtw-wave-1" d="M 0 12 Q 15 0, 30 12 T 60 12 Q 80 24, 90 12 T 120 12 Q 140 6, 160 12 T 190 12 Q 210 21, 230 12 T 260 12 Q 280 3, 300 12" fill="none" stroke="#CF4500" strokeWidth="1.5" />
           </svg>
           
           <div className="mc-dtw-alignments compact-align">
            <svg viewBox="0 0 300 16" preserveAspectRatio="none">
              <line className="dtw-line" x1="30" y1="0" x2="45" y2="16" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line className="dtw-line" x1="90" y1="0" x2="100" y2="16" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line className="dtw-line" x1="160" y1="0" x2="175" y2="16" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line className="dtw-line" x1="230" y1="0" x2="230" y2="16" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
              <line className="dtw-line" x1="300" y1="0" x2="300" y2="16" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>

          <div className="fingerprint-label fp-mt-0">RETURN SIGNATURE</div>
           <svg viewBox="0 0 300 24" className="fingerprint-wave-svg">
              <path className="dtw-wave-2" d="M 0 12 Q 22.5 0, 45 12 T 90 12 Q 95 24, 100 12 T 150 12 Q 162.5 6, 175 12 T 215 12 Q 222.5 21, 230 12 T 265 12 Q 282.5 3, 300 12" fill="none" stroke="#141413" strokeWidth="1.5" />
           </svg>
        </div>
      </ScrollSection>

      {/* THE MAIN TECHNICAL FLOW */}
      <ScrollSection className="mc-insight-section compact-section">
        <h2 className="mc-section-title">The localization pipeline.</h2>
        <div className="mc-graphic-panel pipeline-panel">
          <div className="arch-flow">
            <div className="arch-streams">
              <div className="arch-stream pdr-stream">
                <div className="arch-node">PDR</div>
                <div className="arch-pipe" />
                <div className="arch-node outline">Route Estimate</div>
                <div className="arch-pipe bottom-elbow">
                  <div className="pipe-flow-dot" />
                </div>
              </div>
              <div className="arch-stream mag-stream">
                <div className="arch-node">MAGNETIC FINGERPRINT</div>
                <div className="arch-pipe" />
                <div className="arch-node outline">Sequence Match</div>
                <div className="arch-pipe bottom-elbow-left">
                  <div className="pipe-flow-dot delay-1" />
                </div>
              </div>
            </div>
            <div className="arch-merge-point">
               <div className="arch-node highlight drift-corr-node">
                 DRIFT CORRECTION
               </div>
               <div className="arch-pipe vertical">
                 <div className="pipe-flow-dot delay-2" />
               </div>
               <div className="arch-node final-node">POSITION ALONG ROUTE</div>
            </div>

            <div className="drift-anim-visual">
              <svg viewBox="0 0 200 40">
                <path className="drift-path" d="M 20 20 Q 50 5, 100 20" fill="none" stroke="#6d7480" strokeWidth="1.5" strokeDasharray="2 2" />
                <path className="correct-path" d="M 100 20 Q 150 35, 180 20" fill="none" stroke="#F37338" strokeWidth="2" />
                <circle className="drift-dot" cx="100" cy="20" r="3" fill="#141413" />
              </svg>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* PHONE-IN-POCKET SECTION */}
      <ScrollSection className="mc-insight-section compact-section mc-pocket-positioning">
        <div className="mc-side-by-side">
          <div className="mc-sbs-text">
            <h2 className="mc-section-title">No pointing.<br/>No scanning.<br/>Just walk.</h2>
            <p className="mc-section-desc">
              The phone stays in your pocket. Fusing accelerometer and gyroscope data dynamically compensates for how it bounces and rotates.
            </p>
          </div>
          <div className="mc-sbs-visual compact-visual pocket-visual-compact">
             <svg viewBox="0 0 150 100" className="pocket-svg-small">
                <circle cx="75" cy="50" r="25" fill="rgba(20,20,19,0.02)" stroke="rgba(20,20,19,0.1)" strokeWidth="1" strokeDasharray="2 2" />
                <rect x="65" y="30" width="20" height="40" rx="3" fill="#141413" />
                <circle cx="75" cy="50" r="6" fill="#F37338" className="pulse-circle" />
                <path className="pocket-signal" d="M 10 50 Q 42 20, 75 50 T 140 50" fill="none" stroke="#F37338" strokeWidth="1.5" strokeDasharray="3 3" />
             </svg>
          </div>
        </div>
      </ScrollSection>

      {/* FINAL SECTION */}
      <ScrollSection className="mc-page-footer final-section-compact">
        <div style={{flex: 1}}>
            <p className="mc-footer-tagline">
            Your phone doesn't need to see the path.<br/>
            It can remember how you moved through it.
            </p>
        </div>
        <button className="mc-btn-primary compact-btn" onClick={() => setUi({ route: 'floors' })}>
          <span>Explore 3-Floor Deck</span>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </ScrollSection>
    </div>
  )
}

