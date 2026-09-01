import { PhoneScreen } from './PhoneScreen'
import { useUi } from '../sim/store'

/**
 * iQOO 15 Flagship Smartphone Frame.
 *
 * Modeled strictly after official specifications:
 * - Proportions: 163.65 mm x 76.80 mm x ~8.14-8.28 mm
 * - 6.85" Flat AMOLED display with ~22:10 aspect ratio (1440 x 3168)
 * - Symmetrical hairline bezel
 * - Centered optical punch-hole selfie camera
 * - CNC machined dark aluminium frame with volume rocker & power key
 */
export function PhoneFrame() {
  const mobile = useUi((s) => s.mobile)

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

