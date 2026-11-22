import { motion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { CountdownDuration, DateTarget, Lap, Settings } from '../types'
import { formatLapTime, fromLocalInputValue, pad, toLocalInputValue } from '../lib/time'

interface PanelProps {
  children: ReactNode
  className?: string
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <motion.div
      className={`panel ${className}`}
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.985 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function clampNumber(value: string, max: number): number {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 0
  return Math.min(max, Math.max(0, parsed))
}

interface CountdownSetupProps {
  value: CountdownDuration
  onChange: (value: CountdownDuration) => void
  onStart: () => void
}

export function CountdownSetup({ value, onChange, onStart }: CountdownSetupProps) {
  const fields: { key: keyof CountdownDuration; label: string; max: number }[] = [
    { key: 'days', label: 'Days', max: 365 },
    { key: 'hours', label: 'Hours', max: 23 },
    { key: 'minutes', label: 'Mins', max: 59 },
    { key: 'seconds', label: 'Secs', max: 59 },
  ]

  return (
    <Panel className="setup-panel">
      <span className="panel-eyebrow">Set duration</span>
      <div className="setup-fields">
        {fields.map(({ key, label, max }) => (
          <label key={key} className="setup-field">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={max}
              value={value[key]}
              aria-label={label}
              onChange={(event) => onChange({ ...value, [key]: clampNumber(event.target.value, max) })}
              onFocus={(event) => event.currentTarget.select()}
            />
            <span>{label}</span>
          </label>
        ))}
        <button type="button" className="start-btn" onClick={onStart} aria-label="Start countdown">
          <ArrowRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </Panel>
  )
}

interface DateSetupProps {
  target: DateTarget | null
  onApply: (target: DateTarget) => void
  onClear: () => void
}

export function DateSetup({ target, onApply, onClear }: DateSetupProps) {
  const initial = target ? toLocalInputValue(target.timestamp) : { date: '', time: '' }
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [title, setTitle] = useState(target?.title ?? '')

  // Keep the fields in sync when the target changes from elsewhere.
  useEffect(() => {
    if (!target) return
    const next = toLocalInputValue(target.timestamp)
    setDate(next.date)
    setTime(next.time)
    setTitle(target.title)
  }, [target?.timestamp, target?.title])

  const timestamp = fromLocalInputValue(date, time)
  const valid = timestamp !== null

  return (
    <Panel className="setup-panel date-panel">
      <span className="panel-eyebrow">Countdown to a moment</span>
      <div className="date-fields">
        <label className="date-field">
          <span>Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="date-field">
          <span>Time</span>
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <label className="date-field grow">
          <span>Title</span>
          <input
            type="text"
            value={title}
            maxLength={40}
            placeholder="Optional"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="start-btn"
          disabled={!valid}
          aria-label="Set target"
          onClick={() => {
            if (timestamp !== null) onApply({ timestamp, title: title.trim() })
          }}
        >
          <ArrowRight size={18} strokeWidth={1.5} />
        </button>
        {target && (
          <button type="button" className="clear-target-btn" onClick={onClear} aria-label="Clear target date">
            <X size={13} strokeWidth={1.6} />
          </button>
        )}
      </div>
    </Panel>
  )
}

interface SettingsPanelProps {
  settings: Settings
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      className="toggle"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-checked={checked}
      onClick={onChange}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export function SettingsPanel({ settings, onUpdate, onToggleFullscreen, isFullscreen }: SettingsPanelProps) {
  return (
    <Panel className="settings-panel">
      <span className="panel-eyebrow">Preferences</span>
      <div className="settings-rows">
        <div className="settings-row">
          <label htmlFor="font-scale">Display size</label>
          <input
            id="font-scale"
            type="range"
            min={0.65}
            max={1.4}
            step={0.05}
            value={settings.fontScale}
            onChange={(event) => onUpdate('fontScale', Number(event.target.value))}
          />
        </div>
        <div className="settings-row">
          <span>Sound effects</span>
          <Toggle
            label="Sound effects"
            checked={settings.soundEnabled}
            onChange={() => onUpdate('soundEnabled', !settings.soundEnabled)}
          />
        </div>
        <div className="settings-row">
          <span>Confirm reset</span>
          <Toggle
            label="Confirm reset"
            checked={settings.confirmReset}
            onChange={() => onUpdate('confirmReset', !settings.confirmReset)}
          />
        </div>
        <div className="settings-row">
          <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
          <button type="button" className="text-btn" onClick={onToggleFullscreen}>Toggle</button>
        </div>
      </div>
    </Panel>
  )
}

export interface LapsPanelProps {
  laps: Lap[]
  liveTotal: number
  onClear: () => void
}

export function LapsPanel({ laps, liveTotal, onClear }: LapsPanelProps) {
  if (!laps.length) return null
  const best = Math.min(...laps.map((lap) => lap.duration))
  const worst = Math.max(...laps.map((lap) => lap.duration))

  return (
    <Panel className="laps-panel">
      <div className="laps-header">
        <span className="panel-eyebrow">Laps</span>
        <button type="button" className="text-btn" onClick={onClear}>Clear all</button>
      </div>
      <div className="laps-list">
        {[...laps].reverse().map((lap) => (
          <div key={lap.id} className="lap-row">
            <span className="lap-index">Lap {pad(lap.index)}</span>
            <span className={`lap-duration ${lap.duration === best ? 'best' : ''} ${lap.duration === worst && laps.length > 1 ? 'worst' : ''}`}>
              {formatLapTime(lap.duration)}
            </span>
            <span className="lap-total">{formatLapTime(lap.total)}</span>
          </div>
        ))}
        <div className="lap-row live-row">
          <span className="lap-index">Lap {pad(laps.length + 1)}</span>
          <span className="lap-duration">{formatLapTime(liveTotal - laps[laps.length - 1].total)}</span>
          <span className="lap-total">{formatLapTime(liveTotal)}</span>
        </div>
      </div>
    </Panel>
  )
}

export function ResetConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Panel className="confirm-panel">
      <span>Reset timer?</span>
      <button type="button" className="text-btn" onClick={onConfirm}>Reset</button>
      <button type="button" className="text-btn" onClick={onCancel}>Cancel</button>
    </Panel>
  )
}
