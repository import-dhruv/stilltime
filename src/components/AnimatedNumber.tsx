import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface AnimatedDigitProps {
  digit: string
}

function AnimatedDigit({ digit }: AnimatedDigitProps) {
  const reduceMotion = useReducedMotion()

  return (
    <span className="digit-slot" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.span
          key={digit}
          className="digit"
          initial={reduceMotion ? { opacity: 0 } : { y: '72%', opacity: 0, filter: 'blur(5px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={reduceMotion ? { opacity: 0 } : { y: '-72%', opacity: 0, filter: 'blur(5px)' }}
          transition={{ duration: reduceMotion ? 0.18 : 0.52, ease: [0.16, 1, 0.3, 1] }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

interface AnimatedNumberProps {
  value: string
  className?: string
}

/**
 * Renders each digit in its own slot so only the digits that actually change
 * perform the soft vertical roll — matching the reference's seconds motion.
 */
export default function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  return (
    <span className={`animated-number ${className}`} aria-label={value}>
      {value.split('').map((character, index) =>
        /\d/.test(character) ? (
          <AnimatedDigit key={index} digit={character} />
        ) : (
          <span key={index} className="digit-literal" aria-hidden="true">
            {character}
          </span>
        ),
      )}
    </span>
  )
}
