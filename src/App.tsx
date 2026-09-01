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
  SwapButton,
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
    rm.addEventListener('change', sync)
    // Observe the layout instead of listening for viewport events: matchMedia
    // 'change', 'resize' and 'orientationchange' are all unreliable across
    // mobile browsers and emulated viewports, but a ResizeObserver fires
    // whenever the box actually changes, which is the thing we care about.
    const ro = new ResizeObserver(sync)
    ro.observe(document.documentElement)

    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true })

    return () => {
      uninstall()
      ro.disconnect()
      rm.removeEventListener('change', sync)
      window.removeEventListener('touchstart', onTouch)
    }
  }, [])

  const showTouch = touch || mobile

  return (
    <div className={`app${mobile ? ' mobile' : ''}${swapped ? ' swapped' : ''} phase-${phase}`}>
      <div className="world-panel">
        <MallView />
        {phase !== 'landing' && (
          <>
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(243, 115, 56, 0.15)',
              color: '#F37338',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 100,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              Gamified Prototype
            </div>
            <FloorBadge />
            {!mobile && <ZoomControls />}
            <UsePrompt />
            <WorldToast />
            <KeyLegend />
            <FloorPicker />
            <TransitionVeil />
            {showTouch && <TouchControls />}
            {mobile && <SwapButton swapped={swapped} onToggle={() => setSwapped((v) => !v)} />}
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
