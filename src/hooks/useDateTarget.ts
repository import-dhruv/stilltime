import { useCallback, useEffect, useState } from 'react'
import type { DateTarget } from '../types'
import { useTicker } from './useTicker'

const STORAGE_KEY = 'still.date-target'

function loadTarget(): DateTarget | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DateTarget
    return typeof parsed.timestamp === 'number' ? parsed : null
  } catch {
    return null
  }
}

export function useDateTarget(active: boolean) {
  const [target, setTargetState] = useState<DateTarget | null>(loadTarget)
  const [now, setNow] = useState(() => Date.now())

  useTicker(active, () => setNow(Date.now()), 250)

  useEffect(() => {
    // The ticker is paused outside date mode; refresh immediately on entry.
    if (active) setNow(Date.now())
  }, [active])

  useEffect(() => {
    try {
      if (target) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(target))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage may be unavailable (private mode) — the timer still works */
    }
  }, [target])

  const setTarget = useCallback((next: DateTarget | null) => {
    setNow(Date.now())
    setTargetState(next)
  }, [])

  const remaining = target ? Math.max(0, target.timestamp - now) : 0
  const isPast = target ? target.timestamp <= now : false

  return { target, remaining, isPast, setTarget }
}
