import { AnimatePresence, motion } from 'framer-motion'
import type { TimeParts } from '../types'
import { pad } from '../lib/time'
import AnimatedNumber from './AnimatedNumber'

interface TimeDisplayProps {
  parts: TimeParts
  onToggleControls: () => void
  title?: string
  completed?: boolean
  subtle?: boolean
}

interface UnitProps {
  value: number
  label: string
}

function Unit({ value, label }: UnitProps) {
  return (
    <div className="time-unit">
      <div className="unit-digits">
        <AnimatedNumber value={pad(value)} />
      </div>
      <span className="unit-label">{label}</span>
    </div>
  )
}

function Colon() {
  return (
    <span className="colon-slot" aria-hidden="true">
      <span className="time-colon">:</span>
    </span>
  )
}

export default function TimeDisplay({
  parts,
  onToggleControls,
  title,
  completed = false,
  subtle = false,
}: TimeDisplayProps) {
  return (
    <div
      className="stage"
      onClick={onToggleControls}
      role="button"
      tabIndex={0}
      aria-label="Toggle controls"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onToggleControls()
        }
      }}
    >
      <AnimatePresence>
        {title && (
          <motion.div
            className="stage-title"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`timer-row ${completed ? 'is-complete' : ''}`}
        animate={
          completed
            ? { opacity: [1, 0.7, 1], scale: [1, 1.008, 1] }
            : { opacity: subtle ? 0.55 : 1, scale: 1 }
        }
        transition={completed ? { duration: 1.4, ease: 'easeInOut' } : { duration: 0.6 }}
      >
        <Unit value={parts.days} label="Days" />
        <Colon />
        <Unit value={parts.hours} label="Hours" />
        <Colon />
        <Unit value={parts.minutes} label="Minutes" />
        <Colon />
        <Unit value={parts.seconds} label="Seconds" />
      </motion.div>
    </div>
  )
}
