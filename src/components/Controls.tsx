import { motion } from 'framer-motion'
import {
  CalendarDays,
  Flag,
  Hourglass,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { Mode, Settings } from '../types'
import IconButton from './IconButton'

interface ControlsProps {
  mode: Mode
  isRunning: boolean
  canLap: boolean
  hasLaps: boolean
  settings: Settings
  settingsOpen: boolean
  isFullscreen: boolean
  onModeChange: (mode: Mode) => void
  onToggle: () => void
  onReset: () => void
  onLap: () => void
  onClearLaps: () => void
  onToggleSettings: () => void
  onToggleTheme: () => void
  onToggleSound: () => void
  onToggleFullscreen: () => void
}

const MODES: { value: Mode; label: string; icon: typeof Timer }[] = [
  { value: 'stopwatch', label: 'Stopwatch', icon: Timer },
  { value: 'countdown', label: 'Countdown', icon: Hourglass },
  { value: 'date', label: 'Date', icon: CalendarDays },
]

export default function Controls({
  mode,
  isRunning,
  canLap,
  hasLaps,
  settings,
  settingsOpen,
  isFullscreen,
  onModeChange,
  onToggle,
  onReset,
  onLap,
  onClearLaps,
  onToggleSettings,
  onToggleTheme,
  onToggleSound,
  onToggleFullscreen,
}: ControlsProps) {
  return (
    <motion.div
      className="dock"
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="dock-group mode-group" role="group" aria-label="Timer mode">
        {MODES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            className="mode-btn"
            data-active={mode === value}
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
          >
            <Icon size={13} strokeWidth={1.6} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <span className="dock-divider" aria-hidden="true" />

      <div className="dock-group">
        <IconButton
          label={mode === 'date' ? 'Toggle date setup' : isRunning ? 'Pause' : 'Start'}
          icon={
            mode === 'date' ? (
              <CalendarDays size={17} strokeWidth={1.6} />
            ) : isRunning ? (
              <Pause size={17} strokeWidth={1.7} fill="currentColor" />
            ) : (
              <Play size={17} strokeWidth={1.7} fill="currentColor" />
            )
          }
          onClick={onToggle}
          primary
        />
        <IconButton label="Reset" icon={<RotateCcw size={16} strokeWidth={1.6} />} onClick={onReset} />
        {mode === 'stopwatch' && (
          <IconButton
            label="Record lap"
            icon={<Flag size={16} strokeWidth={1.6} />}
            onClick={onLap}
            active={canLap}
          />
        )}
        {mode === 'stopwatch' && hasLaps && (
          <button type="button" className="text-btn dock-text-btn" onClick={onClearLaps}>
            Clear
          </button>
        )}
      </div>

      <span className="dock-divider" aria-hidden="true" />

      <div className="dock-group">
        <IconButton
          label="Settings"
          icon={<SlidersHorizontal size={16} strokeWidth={1.6} />}
          onClick={onToggleSettings}
          active={settingsOpen}
        />
        <IconButton
          label={settings.theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          icon={settings.theme === 'dark' ? <Sun size={16} strokeWidth={1.6} /> : <Moon size={16} strokeWidth={1.6} />}
          onClick={onToggleTheme}
        />
        <IconButton
          label={settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
          icon={settings.soundEnabled ? <Volume2 size={16} strokeWidth={1.6} /> : <VolumeX size={16} strokeWidth={1.6} />}
          onClick={onToggleSound}
          active={settings.soundEnabled}
        />
        <IconButton
          label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          icon={isFullscreen ? <Minimize2 size={16} strokeWidth={1.6} /> : <Maximize2 size={16} strokeWidth={1.6} />}
          onClick={onToggleFullscreen}
        />
      </div>
    </motion.div>
  )
}
