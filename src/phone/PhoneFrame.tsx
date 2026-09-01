import { PhoneScreen } from './PhoneScreen'
import { useUi } from '../sim/store'

/**
 * The device chassis: a current-generation Android handset - flat display,
 * uniform hairline bezel, centred hole-punch camera, aluminium rail with the
 * volume rocker and power key on the right edge.
 *
 * This is ordinary HTML and CSS. Not an emulator, not a screen mirror. On a
 * real phone the chassis is dropped entirely and the screen becomes the
 * viewport, because you are already holding the device.
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
    <div className="device">
      <span className="key key-volume" aria-hidden="true" />
      <span className="key key-power" aria-hidden="true" />
      <div className="device-body">
        <div className="device-screen">
          <span className="punch-hole" aria-hidden="true" />
          <PhoneScreen />
        </div>
      </div>
    </div>
  )
}
