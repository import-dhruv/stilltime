import { useEffect, useRef } from 'react'

/**
 * requestAnimationFrame-driven ticker. The callback is throttled to `interval`
 * milliseconds; all actual time values are derived from timestamps by callers,
 * so the display never drifts even if frames are dropped.
 */
export function useTicker(active: boolean, callback: () => void, interval = 200): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!active) return
    let frame = 0
    let last = -Infinity

    const loop = (now: number) => {
      if (now - last >= interval) {
        last = now
        callbackRef.current()
      }
      frame = window.requestAnimationFrame(loop)
    }

    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [active, interval])
}
