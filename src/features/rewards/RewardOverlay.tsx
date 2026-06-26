// Festejo + premio al completar un dibujo. Marco "terminaste la tarea -> hay premio",
// con los favoritos de Luci (koala, papas y hamburguesa).

interface Props {
  saved: boolean
  onSave: () => void
  onClose: () => void
}

const CONFETTI = ['🐨', '🍟', '🍔', '⭐', '🎉', '💛', '🐨', '⭐']

export function RewardOverlay({ saved, onSave, onClose }: Props) {
  return (
    <div class="overlay reward" role="dialog" aria-label="Premio">
      <div class="confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span style={`--i:${i}`}>{c}</span>
        ))}
      </div>
      <div class="reward-card">
        <div class="reward-emojis" aria-hidden="true">🐨🍟🍔</div>
        <h2>¡Muy bien, Luci!</h2>
        <p>Terminaste tu dibujo. ¡Te ganaste un premio! 🎉</p>
        <div class="reward-actions">
          <button class="btn-big primary" onClick={onSave} disabled={saved}>
            {saved ? '✓ Guardado' : '💾 Guardar'}
          </button>
          <button class="btn-big" onClick={onClose}>
            Seguir jugando
          </button>
        </div>
      </div>
    </div>
  )
}
