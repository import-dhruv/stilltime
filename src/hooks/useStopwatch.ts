import { useCallback, useRef, useState } from 'react'
import type { Lap } from '../types'
import { useTicker } from './useTicker'

export interface StopwatchApi {
  elapsed: number
  isRunning: boolean
  laps: Lap[]
  start: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  recordLap: () => void
  clearLaps: () => void
}

export function useStopwatch(): StopwatchApi {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])

  const runningRef = useRef(false)
  const startedAtRef = useRef(0)
  const accumulatedRef = useRef(0)
  const lapsRef = useRef<Lap[]>([])
  const lapIdRef = useRef(0)

  const readElapsed = useCallback(
    () => accumulatedRef.current + (runningRef.current ? performance.now() - startedAtRef.current : 0),
    [],
  )

  useTicker(isRunning, () => {
    // 10ms precision keeps the live lap row fluid; the hero display still only
    // changes its digits once per second.
    const next = Math.floor(readElapsed() / 10) * 10
    setElapsed((previous) => (previous === next ? previous : next))
  }, 80)

  const start = useCallback(() => {
    if (runningRef.current) return
    startedAtRef.current = performance.now()
    runningRef.current = true
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    if (!runningRef.current) return
    accumulatedRef.current = readElapsed()
    runningRef.current = false
    setElapsed(accumulatedRef.current)
    setIsRunning(false)
  }, [readElapsed])

  const toggle = useCallback(() => {
    if (runningRef.current) pause()
    else start()
  }, [pause, start])

  const reset = useCallback(() => {
    runningRef.current = false
    startedAtRef.current = 0
    accumulatedRef.current = 0
    lapsRef.current = []
    setElapsed(0)
    setIsRunning(false)
    setLaps([])
  }, [])

  const recordLap = useCallback(() => {
    const total = readElapsed()
    const previousTotal = lapsRef.current.length ? lapsRef.current[lapsRef.current.length - 1].total : 0
    const lap: Lap = {
      id: ++lapIdRef.current,
      index: lapsRef.current.length + 1,
      duration: Math.max(0, total - previousTotal),
      total,
    }
    lapsRef.current = [...lapsRef.current, lap]
    setLaps(lapsRef.current)
  }, [readElapsed])

  const clearLaps = useCallback(() => {
    lapsRef.current = []
    setLaps([])
  }, [])

  return { elapsed, isRunning, laps, start, pause, toggle, reset, recordLap, clearLaps }
}
