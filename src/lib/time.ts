import type { CountdownDuration, TimeParts } from '../types'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Split a millisecond duration into calendar-style time parts. */
export function splitMs(ms: number): TimeParts {
  const totalSeconds = Math.max(0, Math.floor(ms / SECOND))
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function pad(value: number, length = 2): string {
  return String(Math.floor(Math.abs(value))).padStart(length, '0')
}

export function durationToMs(duration: CountdownDuration): number {
  return (
    duration.days * DAY +
    duration.hours * HOUR +
    duration.minutes * MINUTE +
    duration.seconds * SECOND
  )
}

/** 00:12.34 for short laps, 1:02:03.45 once an hour is passed. */
export function formatLapTime(ms: number): string {
  const centis = Math.max(0, Math.floor(ms / 10))
  const minutes = Math.floor(centis / 6000)
  const seconds = Math.floor((centis % 6000) / 100)
  const hundredths = centis % 100
  return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`
}

/** The initial, purely aesthetic state that mirrors the reference image. */
export const REFERENCE_TIME: TimeParts = {
  days: 30,
  hours: 12,
  minutes: 25,
  seconds: 45,
}

export const DEFAULT_COUNTDOWN: CountdownDuration = {
  days: 0,
  hours: 0,
  minutes: 5,
  seconds: 0,
}

export function toLocalInputValue(timestamp: number): { date: string; time: string } {
  const d = new Date(timestamp)
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return { date, time }
}

export function fromLocalInputValue(date: string, time: string): number | null {
  if (!date || !time) return null
  const parsed = new Date(`${date}T${time}:00`).getTime()
  return Number.isFinite(parsed) ? parsed : null
}
