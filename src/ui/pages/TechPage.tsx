import { setUi } from '../../sim/store'

export function TechPage() {
  return (
    <div className="mc-page-container">
      <div className="mc-hero-section">
        <div className="mc-eyebrow">
          <span className="mc-eyebrow-dot" aria-hidden="true" />
          <span>SYSTEM ARCHITECTURE</span>
        </div>
        <h1 className="mc-hero-title">
          Everything happens <br/><span className="mc-hero-em">on the phone.</span>
        </h1>
        <p className="mc-hero-deck">
          No beacons. No garage mapping. No server infrastructure. All core localization processing happens locally on your device.
        </p>
      </div>

      <div className="mc-architecture-diagram">
        <div className="mc-arch-phone">
          <div className="mc-arch-header">iQOO Device</div>
          
          <div className="mc-arch-sensors">
            <div className="mc-arch-node">Accelerometer</div>
            <div className="mc-arch-node">Gyroscope</div>
            <div className="mc-arch-node">Magnetometer</div>
          </div>
          
          <div className="mc-arch-arrow">&darr;</div>
          <div className="mc-arch-node primary">Sensor Fusion</div>
          <div className="mc-arch-arrow">&darr;</div>
          <div className="mc-arch-node primary">Step + Heading Estimation</div>
          <div className="mc-arch-arrow">&darr;</div>
          <div className="mc-arch-node primary">Pedestrian Dead Reckoning</div>
          <div className="mc-arch-arrow">&darr;</div>
          
          <div className="mc-arch-split">
            <div className="mc-arch-branch">
              <div className="mc-arch-node secondary">Route Geometry</div>
            </div>
            <div className="mc-arch-branch">
              <div className="mc-arch-node secondary">Magnetic Fingerprint</div>
            </div>
          </div>
          
          <div className="mc-arch-arrow">&darr;</div>
          <div className="mc-arch-node primary">DTW Matching</div>
          <div className="mc-arch-arrow">&darr;</div>
          <div className="mc-arch-node primary">Confidence Estimation</div>
          <div className="mc-arch-arrow">&darr;</div>
          <div className="mc-arch-node highlight">Return Navigation</div>
        </div>
      </div>

      <div className="mc-sensor-cards-grid">
        <div className="mc-sensor-card">
          <h4 className="mc-sensor-title">Accelerometer</h4>
          <p className="mc-sensor-desc">Detects stepping impacts and fundamental movement cadence.</p>
        </div>
        <div className="mc-sensor-card">
          <h4 className="mc-sensor-title">Gyroscope (Game Rotation)</h4>
          <p className="mc-sensor-desc">Provides relative rotational movement cleanly without relying on magnetic north.</p>
        </div>
        <div className="mc-sensor-card">
          <h4 className="mc-sensor-title">Magnetometer</h4>
          <p className="mc-sensor-desc">Maps magnetic field distortions as a spatial fingerprint, rather than acting as a compass.</p>
        </div>
        <div className="mc-sensor-card">
          <h4 className="mc-sensor-title">Activity Context</h4>
          <p className="mc-sensor-desc">Fuses Bluetooth and OS Activity Recognition to automatically anchor the parking event.</p>
        </div>
      </div>

      <div className="mc-insight-section mc-confidence-section">
        <h2 className="mc-section-title">Confidence-Aware Design</h2>
        <p className="mc-section-desc">
          LodeStone doesn't pretend to know something when confidence is low. 
          Uncertain floor detection and weak magnetic matching degrade gracefully, guiding you to walk further to improve the localization lock.
        </p>
        
        <div className="mc-confidence-viz">
          <div className="mc-conf-row">
            <div className="mc-conf-label">HIGH</div>
            <div className="mc-conf-bar"><div className="mc-conf-fill high" style={{width: '90%'}}></div></div>
            <div className="mc-conf-msg">"You are near the recorded route."</div>
          </div>
          <div className="mc-conf-row">
            <div className="mc-conf-label">MEDIUM</div>
            <div className="mc-conf-bar"><div className="mc-conf-fill med" style={{width: '50%'}}></div></div>
            <div className="mc-conf-msg">"Matching route pattern..."</div>
          </div>
          <div className="mc-conf-row">
            <div className="mc-conf-label">LOW</div>
            <div className="mc-conf-bar"><div className="mc-conf-fill low" style={{width: '20%'}}></div></div>
            <div className="mc-conf-msg">"Continue walking to improve match."</div>
          </div>
        </div>
      </div>

      <div className="mc-insight-section mc-hardware-section">
        <h2 className="mc-section-title">Engineered for the hardware.</h2>
        <p className="mc-section-desc">
          Designed specifically around Android <code>SensorManager</code> capabilities. Performance targets are validated against the actual sensor hardware.
        </p>
      </div>

      <div className="mc-page-footer">
        <p className="mc-footer-tagline">Your phone remembers the walk.</p>
        <button className="mc-btn-primary" onClick={() => setUi({ route: 'overview' })}>
          <span>Back to Overview</span>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
