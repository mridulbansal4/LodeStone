import { useUi, setUi } from '../sim/store'
import { startDemo } from '../sim/actions'

export function Header() {
  const route = useUi((s) => s.route)

  return (
    <header className="mc-header-row" aria-label="Header">
      <div className="mc-brand-open">
        <span className="mc-brand-title">LodeStone</span>
      </div>

      <nav className="mc-nav-pill" aria-label="Main Navigation">
        <div className="mc-nav-links">
          <button
            type="button"
            className={`mc-nav-link ${route === 'overview' ? 'active' : ''}`}
            onClick={() => setUi({ route: 'overview' })}
          >
            Overview
          </button>
          <button
            type="button"
            className={`mc-nav-link ${route === 'pdr' ? 'active' : ''}`}
            onClick={() => setUi({ route: 'pdr' })}
          >
            Inertial PDR
          </button>
          <button
            type="button"
            className={`mc-nav-link ${route === 'floors' ? 'active' : ''}`}
            onClick={() => setUi({ route: 'floors' })}
          >
            3-Floor Deck
          </button>
          <button
            type="button"
            className={`mc-nav-link ${route === 'technology' ? 'active' : ''}`}
            onClick={() => setUi({ route: 'technology' })}
          >
            Technology
          </button>
        </div>

        <div className="mc-nav-actions">
          <button 
            type="button" 
            className="mc-status-pill" 
            onClick={startDemo}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            <span className="mc-pulse-dot" aria-hidden="true" />
            <span>Interactive Demo</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
