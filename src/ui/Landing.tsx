import { startDemo } from '../sim/actions'
import { SimBadge } from './SimBadge'
import { useUi } from '../sim/store'

export function Landing() {
  const phase = useUi((s) => s.phase)
  if (phase !== 'landing') return null

  return (
    <div className="landing">
      <div className="landing-inner">
        <div className="eyebrow">Parking Memory · Prototype</div>
        <h1>Your phone remembers the walk, not the pin.</h1>
        <div className="tagline">Park. Walk away. Find it again.</div>
        <p className="blurb">
          GPS dies under a concrete deck, so a dropped pin lands at the ramp. This playable prototype shows
          what happens when the phone remembers the walk itself instead — recording your route with no
          action from you, then guiding you back through a multi-floor mall.
        </p>
        <button className="cta" onClick={startDemo} autoFocus>
          Start Demo
        </button>
        <div className="legend">
          <span>
            <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> move
          </span>
          <span>
            <kbd>E</kbd> use lift / stairs
          </span>
          <span>
            <kbd>F</kbd> find my car
          </span>
          <span>
            <kbd>R</kbd> restart
          </span>
          <span>
            <kbd>Esc</kbd> controls
          </span>
        </div>
        <SimBadge />
      </div>
    </div>
  )
}
