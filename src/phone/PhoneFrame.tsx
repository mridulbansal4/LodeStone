import { PhoneScreen } from './PhoneScreen'
import { useUi } from '../sim/store'

/**
 * The device chassis. This is ordinary HTML and CSS - not an Android
 * emulator, not a screen mirror. On a real phone the frame is dropped and the
 * screen becomes the viewport, because you are already holding the device.
 */
export function PhoneFrame() {
  const mobile = useUi((s) => s.mobile)
  return (
    <div className={`phone-frame${mobile ? ' bare' : ''}`}>
      <div className="phone-punch" aria-hidden="true" />
      <PhoneScreen />
    </div>
  )
}
