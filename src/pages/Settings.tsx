import { useState } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { useSettings } from '../store/settings'
import { ParentGate } from '../components/ParentGate'

export function Settings() {
  const { route } = useLocation()
  const [unlocked, setUnlocked] = useState(false)
  const s = useSettings()

  if (!unlocked) {
    return <ParentGate onPass={() => setUnlocked(true)} onCancel={() => route('/')} />
  }

  return (
    <div class="settings">
      <header class="home-top">
        <button class="icon-btn" onClick={() => route('/')} aria-label="Volver">←</button>
        <h1 class="home-title">⚙️ Ajustes</h1>
        <span style="width:56px" />
      </header>

      <main class="settings-list">
        <label class="setting-row">
          <span>🔊 Sonidos</span>
          <input type="checkbox" checked={s.sound} onChange={(e) => s.set({ sound: (e.target as HTMLInputElement).checked })} />
        </label>

        <label class="setting-row">
          <span>🎉 Festejo y premio al terminar</span>
          <input type="checkbox" checked={s.celebrate} onChange={(e) => s.set({ celebrate: (e.target as HTMLInputElement).checked })} />
        </label>

        <label class="setting-row">
          <span>🚽 Recordatorio de baño</span>
          <input type="checkbox" checked={s.reminderEnabled} onChange={(e) => s.set({ reminderEnabled: (e.target as HTMLInputElement).checked })} />
        </label>

        <label class={`setting-row ${s.reminderEnabled ? '' : 'disabled'}`}>
          <span>⏰ Avisar cada {s.reminderMinutes} min</span>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={s.reminderMinutes}
            disabled={!s.reminderEnabled}
            onInput={(e) => s.set({ reminderMinutes: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
      </main>
    </div>
  )
}
