import { PhoneScreen } from './PhoneScreen'
import { OriginHomeScreen } from './OriginHomeScreen'
import { useUi } from '../sim/store'

/**
 * iQOO 15 Flagship Smartphone Frame.
 *
 * In Landing Phase: Renders the 3D showcase mockup with OriginOS 6 & Park Trace app.
 * In Demo Phases: Renders the physical iQOO 15 chassis with live PDR navigation simulator.
 */
export function PhoneFrame() {
  const mobile = useUi((s) => s.mobile)
  const phase = useUi((s) => s.phase)

  if (phase === 'landing') {
    return <OriginHomeScreen />
  }

  if (mobile) {
    return (
      <div className="phone-frame bare">
        <PhoneScreen />
      </div>
    )
  }

  return (
    <div className="device iqoo-device">
      {/* Side Hardware Keys on Right Rail */}
      <span className="key key-volume" aria-hidden="true" />
      <span className="key key-power" aria-hidden="true" />

      {/* Precision CNC Aluminium Body */}
      <div className="device-body">
        <div className="device-screen">
          {/* Centered Optical Punch-Hole Camera */}
          <div className="punch-hole" aria-hidden="true">
            <span className="punch-hole-lens" />
          </div>
          <PhoneScreen />
        </div>
      </div>
    </div>
  )
}

