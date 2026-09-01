import { useEffect, useRef, useState } from 'react'
import { setUi } from '../../sim/store'
import '../../styles/floors.css'

export function FloorsPage() {
  const [activeStep, setActiveStep] = useState(1);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute('data-step') || '1', 10);
            setActiveStep(step);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    if (storyRef.current) {
      const steps = storyRef.current.querySelectorAll('.mc-story-step');
      steps.forEach(step => observer.observe(step));
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mc-page-container" style={{ paddingBottom: '0' }}>
      <div className="mc-hero-section">
        <div className="mc-eyebrow">
          <span className="mc-eyebrow-dot" aria-hidden="true" />
          <span>MULTI-FLOOR LOCALIZATION</span>
        </div>
        <h1 className="mc-hero-title">
          One walk. Three floors. <br/><span className="mc-hero-em">One remembered route.</span>
        </h1>
        <p className="mc-hero-deck">
          Park Trace remembers the movement from your parking spot through the garage — even when GPS disappears.
        </p>
      </div>

      <div className="mc-scroll-story">
        <div className="mc-scroll-visual">
          <div className={`mc-isometric-deck step-${activeStep}`}>
            {/* L1 Mall */}
            <div className="mc-iso-layer mc-layer-l1">
              <span className="mc-iso-label">GROUND / MALL</span>
              <svg viewBox="0 0 200 100" className="mc-iso-floor">
                <polygon points="100,10 190,50 100,90 10,50" fill="rgba(255,255,255,0.8)" stroke="#d1d5db" strokeWidth="1" />
                <path d="M100,50 L140,65" fill="none" stroke="#F37338" strokeWidth="2" strokeDasharray="2 2" className="mc-iso-path out-path-l1" />
                <path d="M140,65 L100,50" fill="none" stroke="#141413" strokeWidth="2" strokeDasharray="4 4" className="mc-iso-path return-path-l1" />
                <circle cx="140" cy="65" r="4" fill="#CF4500" className="mc-mall-dot" />
              </svg>
            </div>
            
            {/* B1 Parking */}
            <div className="mc-iso-layer mc-layer-b1">
              <span className="mc-iso-label">BASEMENT 1</span>
              <svg viewBox="0 0 200 100" className="mc-iso-floor">
                <polygon points="100,10 190,50 100,90 10,50" fill="rgba(243, 240, 238, 0.85)" stroke="#d1d5db" strokeWidth="1" />
              </svg>
            </div>

            {/* B2 Parking */}
            <div className="mc-iso-layer mc-layer-b2">
              <span className="mc-iso-label">BASEMENT 2</span>
              <svg viewBox="0 0 200 100" className="mc-iso-floor">
                <polygon points="100,10 190,50 100,90 10,50" fill="rgba(243, 240, 238, 0.85)" stroke="#d1d5db" strokeWidth="1" />
              </svg>
            </div>

            {/* B3 Parking */}
            <div className="mc-iso-layer mc-layer-b3">
              <span className="mc-iso-label">BASEMENT 3</span>
              <svg viewBox="0 0 200 100" className="mc-iso-floor">
                <polygon points="100,10 190,50 100,90 10,50" fill="rgba(243, 240, 238, 0.85)" stroke="#d1d5db" strokeWidth="1" />
                
                <path d="M40,65 L70,80 L100,50" fill="none" stroke="#F37338" strokeWidth="2" strokeDasharray="2 2" className="mc-iso-path out-path-b3" />
                <path d="M100,50 L70,80 L40,65" fill="none" stroke="#141413" strokeWidth="2" strokeDasharray="4 4" className="mc-iso-path return-path-b3" />
                
                <rect x="35" y="60" width="10" height="10" fill="#141413" transform="rotate(30 40 65)" className="mc-car" />
                
                <circle cx="55" cy="72.5" r="1.5" fill="#CF4500" className="mc-step-dot" />
                <circle cx="85" cy="65" r="1.5" fill="#CF4500" className="mc-step-dot" />
              </svg>
            </div>
            
            {/* Architectural Vertical Axis and Elevator */}
            <div className="mc-vertical-axis" />
            <div className="mc-elevator-car" />

            {/* Overlay Sensor Matching DTW for Step 5 */}
            <div className="mc-iso-dtw-overlay">
              <div className="mc-dtw-visualization" style={{ padding: 0, border: 'none', boxShadow: 'none', marginTop: 0 }}>
                <div className="mc-dtw-row">
                  <span className="mc-dtw-label" style={{ width: 50 }}>STORED</span>
                  <svg viewBox="0 0 150 20" className="mc-dtw-wave">
                    <path d="M 0 10 Q 10 2, 20 10 T 40 10 Q 45 18, 50 10 T 70 10 Q 80 0, 90 10 T 110 10 Q 115 15, 120 10 T 140 10 T 150 10" fill="none" stroke="#CF4500" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="mc-dtw-alignments" style={{ paddingLeft: '66px', height: '20px' }}>
                  <svg viewBox="0 0 150 20" preserveAspectRatio="none">
                    <line x1="20" y1="0" x2="30" y2="20" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="50" y1="0" x2="55" y2="20" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="90" y1="0" x2="100" y2="20" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="120" y1="0" x2="120" y2="20" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>
                </div>
                <div className="mc-dtw-row">
                  <span className="mc-dtw-label" style={{ width: 50 }}>LIVE</span>
                  <svg viewBox="0 0 150 20" className="mc-dtw-wave return">
                    <path d="M 0 10 Q 15 2, 30 10 T 45 10 Q 50 18, 55 10 T 75 10 Q 88 0, 100 10 T 115 10 Q 118 15, 120 10 T 145 10 T 150 10" fill="none" stroke="#141413" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="mc-dtw-caption" style={{ marginTop: '8px', paddingTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--mc-ink-black)', fontWeight: 600 }}>MATCH &rarr; ROUTE POSITION</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mc-scroll-text" ref={storyRef}>
          <div className={`mc-story-step ${activeStep === 1 ? 'is-active' : ''}`} data-step="1">
            <div className="mc-step-header">
              <span className="mc-step-number">01</span>
              <span className="mc-step-label">PARK</span>
            </div>
            <div className="mc-step-content">
              <h3>It starts when you leave the car.</h3>
              <p>The prototype combines contextual signals—like Bluetooth disconnection and activity transitions—to confidently infer a parking-to-walking event.</p>
              
              <div className="mc-step-detail" style={{ fontSize: '12.5px', color: 'var(--mc-ink-black)', fontWeight: 600 }}>
                Bluetooth disconnect <span style={{ color: 'var(--mc-dust-taupe)' }}>&rarr;</span> Walking
              </div>
            </div>
          </div>
          
          <div className={`mc-story-step ${activeStep === 2 ? 'is-active' : ''}`} data-step="2">
            <div className="mc-step-header">
              <span className="mc-step-number">02</span>
              <span className="mc-step-label">WALK</span>
            </div>
            <div className="mc-step-content">
              <h3>The phone remembers the walk.</h3>
              <p>As you move through the garage, inertial sensors passively record your steps, distance, and turns. No GPS needed.</p>
              
              <div className="mc-step-detail">
                <div className="mc-conf-row">
                  <span className="mc-conf-label">STEPS</span>
                  <span className="mc-conf-msg" style={{ fontStyle: 'normal', color: 'var(--mc-ink-black)', fontWeight: 600 }}>&bull; &bull; &bull; &bull; &rarr; ROUTE</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mc-story-step ${activeStep === 3 ? 'is-active' : ''}`} data-step="3">
            <div className="mc-step-header">
              <span className="mc-step-number">03</span>
              <span className="mc-step-label">ELEVATION</span>
            </div>
            <div className="mc-step-content">
              <h3>Then the route changes elevation.</h3>
              <p>Park Trace treats elevator and escalator detection as a motion-event classification problem, using barometer and IMU data to estimate floor transitions.</p>
              
              <div className="mc-step-detail" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mc-ink-black)' }}>B3</span>
                 <span style={{ color: 'var(--mc-signal-orange)' }}>&uarr;</span>
                 <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mc-ink-black)' }}>B2</span>
                 <span style={{ color: 'var(--mc-signal-orange)' }}>&uarr;</span>
                 <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mc-ink-black)' }}>B1</span>
              </div>
            </div>
          </div>
          
          <div className={`mc-story-step ${activeStep === 4 ? 'is-active' : ''}`} data-step="4">
            <div className="mc-step-header">
              <span className="mc-step-number">04</span>
              <span className="mc-step-label">MEMORY</span>
            </div>
            <div className="mc-step-content">
              <h3>Park Trace stores the journey, not just a point.</h3>
              <p>By the time you reach the mall, the system has constructed a complete outbound spatial memory of how you got there.</p>
              
              <div className="mc-step-detail" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mc-ink-black)' }}>
                ROUTE <span style={{ color: 'var(--mc-dust-taupe)', margin: '0 4px' }}>&rarr;</span> STORED MEMORY
              </div>
            </div>
          </div>
          
          <div className={`mc-story-step ${activeStep === 5 ? 'is-active' : ''}`} data-step="5">
            <div className="mc-step-header">
              <span className="mc-step-number">05</span>
              <span className="mc-step-label">RETURN</span>
            </div>
            <div className="mc-step-content">
              <h3>Hours later, the phone picks the memory back up.</h3>
              <p>When returning, the system continually matches your live sensor trace against the stored magnetic and spatial memory to figure out where you are along the route.</p>
              
              <div className="mc-step-detail" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mc-ink-black)' }}>
                LIVE TRACE <span style={{ color: 'var(--mc-dust-taupe)', margin: '0 4px' }}>&harr;</span> STORED TRACE
              </div>
            </div>
          </div>

          <div className={`mc-story-step ${activeStep === 6 ? 'is-active' : ''}`} data-step="6">
            <div className="mc-step-header">
              <span className="mc-step-number">06</span>
              <span className="mc-step-label">WAY BACK</span>
            </div>
            <div className="mc-step-content">
              <h3>Not a pin. A way back.</h3>
              <p>The remembered route operates in reverse, tracking your steps backward down through the floors, right to the exact parking spot.</p>
              
              <div className="mc-step-detail" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mc-ink-black)' }}>MALL</span>
                 <span style={{ color: 'var(--mc-dust-taupe)' }}>&rarr;</span>
                 <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mc-ink-black)' }}>ELEVATOR</span>
                 <span style={{ color: 'var(--mc-dust-taupe)' }}>&rarr;</span>
                 <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mc-ink-black)' }}>B3</span>
                 <span style={{ color: 'var(--mc-dust-taupe)' }}>&rarr;</span>
                 <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mc-signal-orange)' }}>CAR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mc-page-footer" style={{ marginTop: '0', padding: '60px 0', borderTop: 'none', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 36px)', margin: 0, fontWeight: 700, color: 'var(--mc-ink-black)', textAlign: 'center' }}>
          Not a pin. <span className="mc-hero-em">A way back.</span>
        </h2>
        <button className="mc-btn-primary" onClick={() => setUi({ route: 'technology' })}>
          <span>Explore Technology &rarr;</span>
        </button>
      </div>
    </div>
  )
}
