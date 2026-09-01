import { useEffect, useState } from 'react'
import { MallView } from './world/MallView'
import { PhoneFrame } from './phone/PhoneFrame'
import { Landing } from './ui/Landing'
import { TouchControls } from './ui/TouchControls'
import {
  FloorBadge,
  ZoomControls,
  UsePrompt,
  FloorPicker,
  TransitionVeil,
  WorldToast,
  KeyLegend,
} from './ui/WorldOverlays'
import { installInput } from './ui/input'
import { startLoop } from './sim/loop'
import { initPreview } from './sim/actions'
import { sim } from './sim/state'
import { useUi, setUi } from './sim/store'

export default function App() {
  const phase = useUi((s) => s.phase)
  const mobile = useUi((s) => s.mobile)
  const [swapped, setSwapped] = useState(false)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    initPreview()
    startLoop()
    const uninstall = installInput()

    const mq = window.matchMedia('(max-width: 767px)')
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setUi({ mobile: mq.matches })
      sim.ui.reducedMotion = rm.matches
    }
    sync()
    mq.addEventListener('change', sync)
    rm.addEventListener('change', sync)
    // matchMedia's change event is not always delivered on orientation or
    // viewport changes in mobile browsers, so re-read on resize too.
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)

    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true })

    return () => {
      uninstall()
      mq.removeEventListener('change', sync)
      rm.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('touchstart', onTouch)
    }
  }, [])

  const showTouch = touch || mobile

  return (
    <div className={`app${mobile ? ' mobile' : ''}${swapped ? ' swapped' : ''}`}>
      <div className="world-panel">
        <MallView />
        {phase !== 'landing' && (
          <>
            <FloorBadge />
            {!mobile && <ZoomControls />}
            <UsePrompt />
            <WorldToast />
            <KeyLegend />
            <FloorPicker />
            <TransitionVeil />
            {showTouch && <TouchControls />}
            {mobile && (
              <button className="swap-btn" onClick={() => setSwapped((s) => !s)}>
                {swapped ? 'Show phone' : 'Full map'}
              </button>
            )}
          </>
        )}
      </div>

      <div className="phone-panel">
        <PhoneFrame />
      </div>

      <Landing />
    </div>
  )
}
