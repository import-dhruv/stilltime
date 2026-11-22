import { useCallback, useRef, useState } from 'react'
import { useTicker } from './useTicker'

export interface CountdownApi {
  duration: number
  remaining: number
  isRunning: boolean
  hasFinished: boolean
  /** Prime with a fresh duration and immediately begin counting. */
  start: (durationMs: number) => void
  pause: () => void
  /** Continue from the paused remaining time. */
  resume: () => void
  reset: () => void
}

export function useCountdown(onComplete: () => void): CountdownApi {
  const [duration, setDuration] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)

  const targetRef = useRef(0)
  const runningRef = useRef(false)
  const durationRef = useRef(0)
  const remainingRef = useRef(0)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useTicker(isRunning, () => {
    const next = Math.max(0, targetRef.current - Date.now())
    remainingRef.current = next
    setRemaining((previous) =>
      Math.floor(previous / 1000) === Math.floor(next / 1000) ? previous : next,
    )

    if (next <= 0) {
      runningRef.current = false
      setIsRunning(false)
      setHasFinished(true)
      completeRef.current()
    }
  }, 120)

  const start = useCallback((durationMs: number) => {
    const value = Math.max(0, durationMs)
    durationRef.current = value
    remainingRef.current = value
    targetRef.current = Date.now() + value
    runningRef.current = value > 0
    setDuration(value)
    setRemaining(value)
    setHasFinished(false)
    setIsRunning(runningRef.current)
    if (value === 0) completeRef.current()
  }, [])

  const pause = useCallback(() => {
    if (!runningRef.current) return
    remainingRef.current = Math.max(0, targetRef.current - Date.now())
    runningRef.current = false
    setRemaining(remainingRef.current)
    setIsRunning(false)
  }, [])

  const resume = useCallback(() => {
    if (runningRef.current || remainingRef.current <= 0) return
    targetRef.current = Date.now() + remainingRef.current
    runningRef.current = true
    setHasFinished(false)
    setIsRunning(true)
  }, [])

  const reset = useCallback(() => {
    runningRef.current = false
    remainingRef.current = durationRef.current
    targetRef.current = 0
    setRemaining(durationRef.current)
    setIsRunning(false)
    setHasFinished(false)
  }, [])

  return { duration, remaining, isRunning, hasFinished, start, pause, resume, reset }
}
