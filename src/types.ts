export type Mode = 'stopwatch' | 'countdown' | 'date'

export type Theme = 'dark' | 'light'

export interface TimeParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface Lap {
  id: number
  index: number
  /** Duration of this individual lap, in milliseconds. */
  duration: number
  /** Total elapsed time at the moment the lap was recorded, in milliseconds. */
  total: number
}

export interface CountdownDuration {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface DateTarget {
  /** Epoch milliseconds of the chosen moment. */
  timestamp: number
  /** Optional custom title displayed above the timer. */
  title: string
}

export interface Settings {
  theme: Theme
  soundEnabled: boolean
  /** Multiplier applied to the hero timer size, 0.65 – 1.4. */
  fontScale: number
  /** Ask before resetting a running / non-empty timer. */
  confirmReset: boolean
}
