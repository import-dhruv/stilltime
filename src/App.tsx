import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CountdownDuration, Mode, TimeParts } from './types'
import {
  DEFAULT_COUNTDOWN,
  REFERENCE_TIME,
  durationToMs,
  splitMs,
} from './lib/time'
import { playSequence, playTone } from './lib/sound'
import { useSettings } from './hooks/useSettings'
import { useStopwatch } from './hooks/useStopwatch'
import { useCountdown } from './hooks/useCountdown'
import { useDateTarget } from './hooks/useDateTarget'
import TimeDisplay from './components/TimeDisplay'
import Controls from './components/Controls'
import {
  CountdownSetup,
  DateSetup,
  LapsPanel,
  ResetConfirm,
  SettingsPanel,
} from './components/Panels'

const MODE_KEY = 'still.mode'

function loadMode(): Mode {
  try {
    const stored = window.localStorage.getItem(MODE_KEY)
    if (stored === 'stopwatch' || stored === 'countdown' || stored === 'date') return stored
  } catch {
    /* ignore */
  }
  return 'stopwatch'
}

export default function App() {
  const [mode, setMode] = useState<Mode>(loadMode)
  const [pristine, setPristine] = useState(true)
  const [countdownDuration, setCountdownDuration] = useState<CountdownDuration>(DEFAULT_COUNTDOWN)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dateSetupOpen, setDateSetupOpen] = useState(true)
  const [resetRequested, setResetRequested] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [pinned, setPinned] = useState(false)
  const [pointerNearBottom, setPointerNearBottom] = useState(false)
  const [overlayHovered, setOverlayHovered] = useState(false)
  const [flash, setFlash] = useState(false)
  const flashTimeout = useRef<number | undefined>(undefined)

  const { settings, update } = useSettings()
  const stopwatch = useStopwatch()
  const dateTarget = useDateTarget(mode === 'date')
  const wasPast = useRef(false)

  const cue = useCallback(
    (frequency: number, duration = 0.09) => {
      if (settings.soundEnabled) playTone(frequency, duration)
    },
    [settings.soundEnabled],
  )

  const handleCountdownComplete = useCallback(() => {
    if (settings.soundEnabled) playSequence([880, 1108, 1318])
  }, [settings.soundEnabled])

  const countdown = useCountdown(handleCountdownComplete)

  const revealBriefly = useCallback(() => {
    setFlash(true)
    window.clearTimeout(flashTimeout.current)
    flashTimeout.current = window.setTimeout(() => setFlash(false), 1800)
  }, [])

  useEffect(() => () => window.clearTimeout(flashTimeout.current), [])

  useEffect(() => {
    try {
      window.localStorage.setItem(MODE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  /* ------------------------------- actions ------------------------------ */

  const handlePrimary = useCallback(() => {
    setPristine(false)
    revealBriefly()

    if (mode === 'stopwatch') {
      cue(stopwatch.isRunning ? 420 : 700)
      stopwatch.toggle()
      return
    }

    if (mode === 'countdown') {
      if (countdown.isRunning) {
        cue(420)
        countdown.pause()
      } else if (countdown.duration > 0 && countdown.remaining < countdown.duration) {
        cue(700)
        countdown.resume()
      } else {
        cue(700)
        countdown.start(durationToMs(countdownDuration))
      }
      return
    }

    setDateSetupOpen((open) => !open)
  }, [mode, stopwatch, countdown, countdownDuration, cue, revealBriefly])

  const hasProgress =
    mode === 'stopwatch'
      ? stopwatch.elapsed > 0 || stopwatch.laps.length > 0
      : mode === 'countdown'
        ? countdown.duration > 0
        : dateTarget.target !== null

  const performReset = useCallback(() => {
    if (mode === 'stopwatch') stopwatch.reset()
    else if (mode === 'countdown') countdown.reset()
    else dateTarget.setTarget(null)
    cue(330)
    setResetRequested(false)
  }, [mode, stopwatch, countdown, dateTarget, cue])

  const handleReset = useCallback(() => {
    revealBriefly()
    if (settings.confirmReset && hasProgress) setResetRequested(true)
    else performReset()
  }, [settings.confirmReset, hasProgress, performReset, revealBriefly])

  const handleLap = useCallback(() => {
    stopwatch.recordLap()
    cue(980, 0.06)
    revealBriefly()
  }, [stopwatch, cue, revealBriefly])

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (next === mode) return
      setMode(next)
      setResetRequested(false)
      setSettingsOpen(false)
      setPinned(true)
      cue(560, 0.05)
    },
    [mode, cue],
  )

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      /* fullscreen can be blocked by the browser — fail silently */
    }
    revealBriefly()
  }, [revealBriefly])

  const toggleTheme = useCallback(() => {
    update('theme', settings.theme === 'dark' ? 'light' : 'dark')
    cue(620, 0.05)
  }, [settings.theme, update, cue])

  const toggleSound = useCallback(() => {
    update('soundEnabled', !settings.soundEnabled)
    if (!settings.soundEnabled) playTone(760, 0.09)
  }, [settings.soundEnabled, update])

  /* --------------------------- global listeners -------------------------- */

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      setPointerNearBottom(event.clientY > window.innerHeight - 140)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable = Boolean(
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable),
      )

      if (event.key === 'Escape') {
        if (isEditable) target?.blur()
        setPinned(false)
        setPointerNearBottom(false)
        setOverlayHovered(false)
        setFlash(false)
        setSettingsOpen(false)
        setResetRequested(false)
        return
      }

      if (isEditable) return

      if (event.code === 'Space') {
        event.preventDefault()
        handlePrimary()
      } else if (event.key === 'r' || event.key === 'R') {
        handleReset()
      } else if (event.key === 'l' || event.key === 'L') {
        if (mode === 'stopwatch') handleLap()
        else revealBriefly()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlePrimary, handleReset, handleLap, mode, revealBriefly])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (dateTarget.isPast && !wasPast.current && dateTarget.target && settings.soundEnabled) {
      playSequence([880, 1108, 1318])
    }
    wasPast.current = dateTarget.isPast
  }, [dateTarget.isPast, dateTarget.target, settings.soundEnabled])

  /* -------------------------------- display ------------------------------ */

  const displayParts: TimeParts =
    mode === 'stopwatch' && pristine
      ? REFERENCE_TIME
      : mode === 'stopwatch'
        ? splitMs(stopwatch.elapsed)
        : mode === 'countdown'
          ? splitMs(
              countdown.duration === 0 && !countdown.isRunning
                ? durationToMs(countdownDuration)
                : countdown.remaining,
            )
          : dateTarget.target
            ? splitMs(dateTarget.remaining)
            : REFERENCE_TIME

  const isRunning =
    mode === 'stopwatch' ? stopwatch.isRunning : mode === 'countdown' ? countdown.isRunning : false

  const completed =
    mode === 'countdown'
      ? countdown.hasFinished
      : mode === 'date'
        ? Boolean(dateTarget.target && dateTarget.isPast)
        : false

  const controlsVisible = pinned || pointerNearBottom || overlayHovered || flash

  const onOverlayPointerEnter = (event: ReactPointerEvent) => {
    if (event.pointerType === 'touch') return
    setOverlayHovered(true)
  }

  return (
    <div
      className="app"
      style={{ '--font-scale': settings.fontScale } as CSSProperties}
      data-controls={controlsVisible}
    >
      <TimeDisplay
        parts={displayParts}
        title={mode === 'date' ? dateTarget.target?.title : undefined}
        completed={completed}
        onToggleControls={() => {
          setFlash(false)
          setPinned((value) => !value)
        }}
      />

      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            className="overlay-stack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onPointerEnter={onOverlayPointerEnter}
            onPointerLeave={() => setOverlayHovered(false)}
          >
            <AnimatePresence mode="popLayout">
              {resetRequested && (
                <ResetConfirm
                  onConfirm={performReset}
                  onCancel={() => setResetRequested(false)}
                />
              )}
              {settingsOpen && (
                <SettingsPanel
                  settings={settings}
                  onUpdate={update}
                  onToggleFullscreen={toggleFullscreen}
                  isFullscreen={isFullscreen}
                />
              )}
              {mode === 'stopwatch' && stopwatch.laps.length > 0 && (
                <LapsPanel
                  laps={stopwatch.laps}
                  liveTotal={stopwatch.elapsed}
                  onClear={stopwatch.clearLaps}
                />
              )}
              {mode === 'countdown' && !countdown.isRunning && (
                <CountdownSetup
                  value={countdownDuration}
                  onChange={setCountdownDuration}
                  onStart={() => {
                    setPristine(false)
                    cue(700)
                    countdown.start(durationToMs(countdownDuration))
                  }}
                />
              )}
              {mode === 'date' && dateSetupOpen && (
                <DateSetup
                  target={dateTarget.target}
                  onApply={(target) => {
                    setPristine(false)
                    dateTarget.setTarget(target)
                    cue(760, 0.07)
                  }}
                  onClear={() => {
                    dateTarget.setTarget(null)
                    cue(330)
                  }}
                />
              )}
            </AnimatePresence>

            <Controls
              mode={mode}
              isRunning={isRunning}
              canLap={stopwatch.isRunning || stopwatch.elapsed > 0}
              hasLaps={stopwatch.laps.length > 0}
              settings={settings}
              settingsOpen={settingsOpen}
              isFullscreen={isFullscreen}
              onModeChange={handleModeChange}
              onToggle={handlePrimary}
              onReset={handleReset}
              onLap={handleLap}
              onClearLaps={stopwatch.clearLaps}
              onToggleSettings={() => setSettingsOpen((open) => !open)}
              onToggleTheme={toggleTheme}
              onToggleSound={toggleSound}
              onToggleFullscreen={toggleFullscreen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
