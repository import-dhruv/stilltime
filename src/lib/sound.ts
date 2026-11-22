let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      context = new Ctor()
    }
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

/** A soft, short tone. Called only from user gestures or timer completion. */
export function playTone(frequency = 720, duration = 0.09, gain = 0.045): void {
  const ctx = getContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const envelope = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  envelope.gain.setValueAtTime(0.0001, ctx.currentTime)
  envelope.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.012)
  envelope.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

  oscillator.connect(envelope)
  envelope.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration + 0.02)
}

export function playSequence(notes: number[]): void {
  notes.forEach((note, index) => {
    window.setTimeout(() => playTone(note, 0.16, 0.05), index * 130)
  })
}
