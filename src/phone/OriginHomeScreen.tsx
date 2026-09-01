import { useState } from 'react'
import { startDemo } from '../sim/actions'
import iqoo15DuoImg from '../assets/iqoo15_duo_mockup.png'

/**
 * iQOO 15 Flagship Duo Showcase Mockup with OriginOS 6 & Park Trace App.
 *
 * Embeds the high-definition iQOO 15 smartphone visual with an interactive
 * touch target over the Park Trace app icon that triggers the live demo on click.
 */
export function OriginHomeScreen() {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="iqoo-mockup-container">
      <div className="iqoo-mockup-wrapper">
        {/* High-Definition 3D Duo Smartphone Visual */}
        <img
          src={iqoo15DuoImg}
          alt="iQOO 15 Flagship Smartphone with OriginOS 6"
          className="iqoo-mockup-img"
          draggable={false}
        />

        {/* Specular OLED Glass Highlight Overlay */}
        <div className="iqoo-mockup-glass" aria-hidden="true" />

        {/* Interactive Park Trace App Touch Target */}
        <button
          type="button"
          className={`iqoo-app-touch-target ${hovered ? 'hovered' : ''}`}
          onClick={startDemo}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title="Launch Park Trace Demo on iQOO 15"
          aria-label="Launch Park Trace Demo"
        >
          <span className="iqoo-touch-ripple" aria-hidden="true" />
          <span className="iqoo-touch-pulse" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
