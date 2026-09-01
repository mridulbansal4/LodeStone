import { useUi } from '../sim/store'
import { Header } from './Header'
import { Overview } from './pages/Overview'
import { PdrPage } from './pages/PdrPage'
import { FloorsPage } from './pages/FloorsPage'
import { TechPage } from './pages/TechPage'

/**
 * Mastercard-inspired Landing Page shell.
 * Handles the unified layout, background, watermark, footer, and dynamic routing
 * between the product storytelling pages.
 */
export function Landing() {
  const phase = useUi((s) => s.phase)
  const route = useUi((s) => s.route)

  if (phase !== 'landing') return null

  return (
    <div className="mc-landing">
      {/* Ghost watermark background typography */}
      <div className="mc-watermark" aria-hidden="true">
        LODESTONE NAVIGATION
      </div>

      {/* Floating Header with Open LodeStone Wordmark & Navigation */}
      <header className="mc-header-row" aria-label="Header">
        <div className="mc-brand-open">
          <span className="mc-brand-title">LodeStone</span>
        </div>

        <nav className="mc-nav-pill" aria-label="Main Navigation">
          <div className="mc-nav-links">
            <button type="button" className="mc-nav-link active">Overview</button>
            <button type="button" className="mc-nav-link">Inertial PDR</button>
            <button type="button" className="mc-nav-link">3-Floor Deck</button>
            <button type="button" className="mc-nav-link">Technology</button>
          </div>

          <div className="mc-nav-actions">
            <div className="mc-status-pill">
              <span className="mc-pulse-dot" aria-hidden="true" />
              <span>Interactive Demo</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="mc-landing-content">
        {route === 'overview' && <Overview />}
        {route === 'pdr' && <PdrPage />}
        {route === 'floors' && <FloorsPage />}
        {route === 'technology' && <TechPage />}
      </div>

      {/* Bottom Honesty Disclosure */}
      <footer className="mc-footer-disclosure">
        <span className="mc-disclosure-dot" aria-hidden="true" />
        <span className="mc-disclosure-text">
          Simulation. Every figure this prototype shows is derived from the game state, not from a sensor.
        </span>
      </footer>
    </div>
  )
}
