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
        PARK TRACE NAVIGATION
      </div>

      {/* Floating Header with Open Park Trace Logo & Navigation */}
      <Header />


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
