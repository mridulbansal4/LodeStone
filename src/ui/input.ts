import { sim } from '../sim/state'
import { requestTransition, startTransition } from '../sim/floors'
import { startDemo, restart, findMyCar, beginGuidance } from '../sim/actions'
import { nudgeZoom } from '../world/camera'
import { useUi, setUi } from '../sim/store'

const MOVE_KEYS: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

export function installInput() {
  const down = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    const mv = MOVE_KEYS[e.code]
    if (mv) {
      sim.input[mv] = true
      e.preventDefault()
      return
    }

    switch (e.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        sim.input.slow = true
        break
      case 'KeyE':
        if (sim.ui.floorPicker) sim.ui.floorPicker = false
        else requestTransition()
        break
      case 'KeyF':
        findMyCar()
        break
      case 'KeyG':
        beginGuidance()
        break
      case 'KeyR':
        restart()
        break
      case 'Enter':
      case 'Space':
        if (sim.phase === 'landing') {
          startDemo()
          e.preventDefault()
        } else if (sim.phase === 'routeOverview') {
          beginGuidance()
          e.preventDefault()
        }
        break
      case 'Escape':
        if (sim.ui.floorPicker) sim.ui.floorPicker = false
        else setUi({ showLegend: !useUi.getState().showLegend })
        break
      case 'Digit1':
      case 'Digit2':
      case 'Digit3': {
        if (!sim.ui.floorPicker) break
        const i = Number(e.code.slice(5)) - 1
        const target = sim.ui.padTargets[i]
        if (target !== undefined) startTransition(target)
        break
      }
      case 'Equal':
      case 'NumpadAdd':
        nudgeZoom(0.15)
        break
      case 'Minus':
      case 'NumpadSubtract':
        nudgeZoom(-0.15)
        break
    }
  }

  const up = (e: KeyboardEvent) => {
    const mv = MOVE_KEYS[e.code]
    if (mv) sim.input[mv] = false
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') sim.input.slow = false
  }

  const blur = () => {
    sim.input.up = sim.input.down = sim.input.left = sim.input.right = false
    sim.input.slow = false
    sim.input.joy.x = 0
    sim.input.joy.y = 0
  }

  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)

  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
  }
}
