import { useEffect, useState } from 'preact/hooks'
import { useSettings } from '../../store/settings'
import { playReminder } from '../../lib/sound'

// Recordatorio de bano: a Luci a veces se le olvida ir. Aviso suave y configurable.
// Mientras el aviso esta visible no se reprograma; al cerrarlo, vuelve a contar.
export function useBathroomReminder() {
  const reminderEnabled = useSettings((s) => s.reminderEnabled)
  const reminderMinutes = useSettings((s) => s.reminderMinutes)
  const sound = useSettings((s) => s.sound)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!reminderEnabled || active) return
    const ms = Math.max(1, reminderMinutes) * 60_000
    const t = setTimeout(() => {
      setActive(true)
      if (sound) playReminder()
    }, ms)
    return () => clearTimeout(t)
  }, [reminderEnabled, reminderMinutes, active, sound])

  return { active, dismiss: () => setActive(false) }
}
