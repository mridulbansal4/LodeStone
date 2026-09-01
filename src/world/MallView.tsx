import { useEffect, useRef } from 'react'
import { render } from './renderer'
import { updateCamera, nudgeZoom } from './camera'

/**
 * The mall world. Reads `sim` directly inside its own animation frame - it
 * never subscribes to React state, so a stat ticking over on the phone costs
 * nothing here.
 */
export function MallView() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const frame = () => {
      raf = requestAnimationFrame(frame)
      updateCamera()
      render(ctx, w, h)
    }
    raf = requestAnimationFrame(frame)

    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      nudgeZoom(e.deltaY > 0 ? -0.1 : 0.1)
    }
    canvas.addEventListener('wheel', wheel, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('wheel', wheel)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" />
}
