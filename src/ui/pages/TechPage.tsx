import { useEffect, useRef, useState, ReactNode } from 'react'
import { startDemo } from '../../sim/actions'
import '../../styles/tech.css'

function Reveal({ children, className = '', threshold = 0.2 }: { children: ReactNode, className?: string, threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )
    
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div ref={ref} className={`${className} mc-reveal ${isVisible ? 'is-visible' : ''}`}>
      {children}
    </div>
  )
}

export function TechPage() {
  return (
    <div className="mc-tech-page">
      {/* 01. HERO SECTION (Combined with 4 sensors) */}
      <Reveal className="mc-tech-hero" threshold={0.1}>
        <h1>Everything important happens <br /> on the phone.</h1>
        <p>No beacons. No garage infrastructure. No camera interaction. No server required for the core localization pipeline.</p>
        
        <div className="mc-hero-hub-container">
          {/* Desktop Hero Layout */}
          <div className="mc-hero-desktop">
            <svg className="mc-hero-svg" viewBox="0 0 700 340">
              {/* Top-Left to Center */}
              <line x1="120" y1="80" x2="310" y2="130" className="mc-hero-line" />
              <line x1="120" y1="80" x2="310" y2="130" className="mc-hero-pulse mc-delay-1" pathLength="100" />
              {/* Top-Right to Center */}
              <line x1="580" y1="80" x2="390" y2="130" className="mc-hero-line" />
              <line x1="580" y1="80" x2="390" y2="130" className="mc-hero-pulse mc-delay-2" pathLength="100" />
              {/* Bottom-Left to Center */}
              <line x1="120" y1="260" x2="310" y2="210" className="mc-hero-line" />
              <line x1="120" y1="260" x2="310" y2="210" className="mc-hero-pulse mc-delay-3" pathLength="100" />
              {/* Bottom-Right to Center */}
              <line x1="580" y1="260" x2="390" y2="210" className="mc-hero-line" />
              <line x1="580" y1="260" x2="390" y2="210" className="mc-hero-pulse mc-delay-4" pathLength="100" />
            </svg>
            
            <div className="mc-hero-node mc-node-tl">
              <div className="mc-node-title">Accelerometer</div>
              <div className="mc-node-desc">movement + steps</div>
            </div>
            <div className="mc-hero-node mc-node-tr">
              <div className="mc-node-title">Gyroscope</div>
              <div className="mc-node-desc">relative rotation</div>
            </div>
            <div className="mc-hero-node mc-node-bl">
              <div className="mc-node-title">Magnetometer</div>
              <div className="mc-node-desc">spatial fingerprint</div>
            </div>
            <div className="mc-hero-node mc-node-br">
              <div className="mc-node-title">Step Detector</div>
              <div className="mc-node-desc">parking to walking</div>
            </div>
            
            <div className="mc-phone-core"></div>
          </div>

          {/* Mobile Hero Layout */}
          <div className="mc-hero-mobile">
            <div className="mc-hero-node-mobile">
              <div className="mc-node-title">Accelerometer</div>
              <div className="mc-node-desc">movement + steps</div>
            </div>
            <div className="mc-mobile-link"><div className="mc-mobile-pulse mc-delay-1"></div></div>
            
            <div className="mc-hero-node-mobile">
              <div className="mc-node-title">Gyroscope</div>
              <div className="mc-node-desc">relative rotation</div>
            </div>
            <div className="mc-mobile-link"><div className="mc-mobile-pulse mc-delay-2"></div></div>
            
            <div className="mc-hero-node-mobile">
              <div className="mc-node-title">Magnetometer</div>
              <div className="mc-node-desc">spatial fingerprint</div>
            </div>
            <div className="mc-mobile-link"><div className="mc-mobile-pulse mc-delay-3"></div></div>
            
            <div className="mc-hero-node-mobile">
              <div className="mc-node-title">Step Detector</div>
              <div className="mc-node-desc">parking to walking</div>
            </div>
            <div className="mc-mobile-link"><div className="mc-mobile-pulse mc-delay-4"></div></div>
            
            <div className="mc-phone-core-mobile"></div>
          </div>
        </div>
      </Reveal>

      {/* 02. PIPELINE */}
      <Reveal className="mc-tech-section">
        <div className="mc-tech-section-header">
          <h2>From raw motion to route.</h2>
        </div>
        <div className="mc-diagram-box mc-compact-diagram">
          <div className="mc-flow-row horizontal-mobile" style={{ flexWrap: 'wrap' }}>
            <div className="mc-flow-item">SENSORS</div>
            <div className="mc-flow-arrow horizontal-mobile">&rarr;</div>
            <div className="mc-flow-item">SENSOR FUSION</div>
            <div className="mc-flow-arrow horizontal-mobile">&rarr;</div>
            <div className="mc-flow-item">PDR</div>
            <div className="mc-flow-arrow horizontal-mobile">&rarr;</div>
            <div className="mc-flow-item">ROUTE MEMORY</div>
          </div>
        </div>
      </Reveal>

      {/* 03. MAGNETIC + DTW + DRIFT */}
      <Reveal className="mc-tech-section">
        <div className="mc-tech-section-header">
          <h2>We remember the magnetic landscape.</h2>
          <p>PDR estimates the path. Magnetic matching corrects accumulated drift.</p>
        </div>
        <div className="mc-diagram-box">
          {/* DTW */}
          <div className="mc-dtw-viz">
            <div className="mc-wave-container">
              <div className="mc-wave-label">RECORDED<br/>(Slow)</div>
              <svg className="mc-wave-svg" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path className="mc-wave-path" d="M0,30 Q50,10 100,30 T200,50 T300,10 T400,30" />
              </svg>
            </div>
            <div className="mc-dtw-lines" style={{ top: 20, bottom: 20 }}>
               <div className="mc-dtw-line"></div>
               <div className="mc-dtw-line"></div>
               <div className="mc-dtw-line"></div>
               <div className="mc-dtw-line"></div>
            </div>
            <div className="mc-wave-container">
              <div className="mc-wave-label">RETURN<br/>(Fast)</div>
              <svg className="mc-wave-svg" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path className="mc-wave-path mc-gray-path" d="M0,30 Q80,10 160,30 T280,50 T360,10 T400,30" />
              </svg>
            </div>
          </div>
          
          {/* Drift Snap */}
          <div className="mc-drift-viz" style={{ height: '80px', marginTop: '20px' }}>
            <svg viewBox="0 0 500 80">
              <path className="mc-drift-path mc-drift-pdr" d="M50,70 L150,60 L250,45 L350,20 L450,5" />
              <path className="mc-drift-path mc-drift-corrected animated" d="M50,70 L150,60 L250,55 L350,50 L450,55" />
              <circle cx="250" cy="55" r="4" fill="var(--mc-signal-orange)" />
              <text x="250" y="75" fontSize="10" fill="var(--mc-slate-gray)" textAnchor="middle">MAGNETIC MATCH</text>
            </svg>
          </div>
        </div>
      </Reveal>

      {/* 04. FLOOR + CONFIDENCE (Split layout) */}
      <Reveal className="mc-tech-section">
        <div className="mc-split-section">
          {/* FLOOR */}
          <div className="mc-diagram-box mc-split-box">
            <h3 className="mc-split-title">Elevation is another motion event.</h3>
            <div className="mc-flow-row horizontal-mobile" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div className="mc-flow-item small">Walking</div>
              <div className="mc-flow-arrow small horizontal-mobile">&rarr;</div>
              <div className="mc-flow-item small">Elevator</div>
              <div className="mc-flow-arrow small horizontal-mobile">&rarr;</div>
              <div className="mc-flow-item small">Floor Est.</div>
            </div>
            <div className="mc-floor-confidence">
              <div style={{ fontSize: '11px', color: 'var(--mc-granite)', fontWeight: 600 }}>ELEVATOR CONFIDENCE</div>
              <div className="mc-floor-conf-value">0.78</div>
              <div style={{ fontSize: '10px', color: 'var(--mc-slate-gray)', marginTop: '4px', fontStyle: 'italic', textAlign: 'center' }}>* Evaluates sensor evidence over time.</div>
            </div>
          </div>
          
          {/* CONFIDENCE */}
          <div className="mc-diagram-box mc-split-box">
            <h3 className="mc-split-title">When the phone isn't sure, it says so.</h3>
            <div className="mc-conf-row"><div className="mc-conf-label">HIGH</div><div className="mc-conf-bar-bg"><div className="mc-conf-bar-fill mc-conf-high" style={{width:'90%'}}></div></div></div>
            <div className="mc-conf-row"><div className="mc-conf-label">MED</div><div className="mc-conf-bar-bg"><div className="mc-conf-bar-fill mc-conf-med" style={{width:'60%'}}></div></div></div>
            <div className="mc-conf-row"><div className="mc-conf-label">LOW</div><div className="mc-conf-bar-bg"><div className="mc-conf-bar-fill mc-conf-low" style={{width:'25%'}}></div></div></div>
            <div className="mc-conf-ui-example">
              <div>Localization confidence: <span className="highlight">LOW</span></div>
              <div style={{ color: 'var(--mc-granite)', marginTop: '4px', fontSize: '11px' }}>Continue walking to improve the match.</div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 05. ON-DEVICE ARCHITECTURE STACK */}
      <Reveal className="mc-tech-section">
        <div className="mc-diagram-box">
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>iQOO PHONE</div>
          <div className="mc-full-pipeline">
            <div className="mc-pipeline-box compact mc-delay-1">SensorManager</div>
            <div className="mc-pipeline-arrow-down compact mc-delay-1"></div>
            <div className="mc-pipeline-box compact mc-delay-2">Sensor Streams</div>
            <div className="mc-pipeline-arrow-down compact mc-delay-2"></div>
            <div className="mc-pipeline-box compact mc-delay-3">PDR + Magnetic Matching</div>
            <div className="mc-pipeline-arrow-down compact mc-delay-3"></div>
            <div className="mc-pipeline-box compact mc-delay-4">Route Memory</div>
            <div className="mc-pipeline-arrow-down compact mc-delay-4"></div>
            <div className="mc-pipeline-box compact highlight mc-delay-5">Localization</div>
          </div>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal className="mc-tech-cta">
        <h2>All that complexity disappears for the person carrying the phone.</h2>
        <button className="mc-btn-primary" onClick={startDemo}>
          <span>Try the Interactive Demo</span>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginLeft: '8px' }}>
            <path d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Reveal>
    </div>
  )
}
