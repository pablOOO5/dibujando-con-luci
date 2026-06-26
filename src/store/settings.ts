import { create } from 'zustand'

// Ajustes (para papas). Persisten en localStorage. El parent-gate vive en la pantalla
// de Ajustes para que Luci no los cambie sin querer.
export interface Settings {
  /** Sonidos suaves al pintar / festejar. */
  sound: boolean
  /** Animacion de festejo + premio al completar. */
  celebrate: boolean
  /** Recordatorio de bano activo. */
  reminderEnabled: boolean
  /** Cada cuantos minutos recordar ir al bano. */
  reminderMinutes: number
}

interface SettingsState extends Settings {
  set: (patch: Partial<Settings>) => void
}

const KEY = 'luci.settings'

const defaults: Settings = {
  sound: true,
  celebrate: true,
  reminderEnabled: true,
  reminderMinutes: 30,
}

function load(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return defaults
  }
}

function persist(s: Settings) {
  const { sound, celebrate, reminderEnabled, reminderMinutes } = s
  localStorage.setItem(KEY, JSON.stringify({ sound, celebrate, reminderEnabled, reminderMinutes }))
}

export const useSettings = create<SettingsState>((set) => ({
  ...load(),
  set: (patch) =>
    set((s) => {
      const next = { ...s, ...patch }
      persist(next)
      return next
    }),
}))
