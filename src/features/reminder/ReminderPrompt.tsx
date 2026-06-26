interface Props {
  onDone: () => void
}

// Aviso amable de bano. Lenguaje simple y un solo boton grande.
export function ReminderPrompt({ onDone }: Props) {
  return (
    <div class="overlay reminder" role="dialog" aria-label="Recordatorio de bano">
      <div class="reminder-card">
        <div class="reminder-emoji" aria-hidden="true">🚽</div>
        <h2>¿Vamos al baño, Luci?</h2>
        <p>Hacemos pis y seguimos jugando 💛</p>
        <button class="btn-big primary" onClick={onDone}>
          Listo ✓
        </button>
      </div>
    </div>
  )
}
