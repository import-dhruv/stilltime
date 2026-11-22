import { useCallback, useEffect, useState } from 'react'
import type { Settings } from '../types'

const STORAGE_KEY = 'still.settings'

const DEFAULTS: Settings = {
  theme: 'dark',
  soundEnabled: false,
  fontScale: 1,
  confirmReset: true,
}

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', settings.theme === 'dark' ? '#000000' : '#f4f4f2')
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((previous) => ({ ...previous, [key]: value }))
  }, [])

  return { settings, update }
}
