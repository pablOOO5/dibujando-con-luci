import { useMemo, useState } from 'preact/hooks'

interface Props {
  onPass: () => void
  onCancel: () => void
}

// Candado simple para papas: una suma para que Luci no entre sin querer a los ajustes.
export function ParentGate({ onPass, onCancel }: Props) {
  const { a, b } = useMemo(() => ({
    a: 2 + Math.floor(Math.random() * 7),
    b: 2 + Math.floor(Math.random() * 7),
  }), [])
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function check() {
    if (Number(value) === a + b) onPass()
    else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div class="overlay" role="dialog" aria-label="Solo para papas">
      <div class="gate-card">
        <h2>Solo para papás 👀</h2>
        <p>
          ¿Cuánto es <strong>{a} + {b}</strong>?
        </p>
        <input
          class="gate-input"
          type="number"
          inputMode="numeric"
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          aria-label="Resultado"
        />
        {error && <p class="gate-error">Probá de nuevo</p>}
        <div class="reward-actions">
          <button class="btn-big primary" onClick={check}>
            Entrar
          </button>
          <button class="btn-big" onClick={onCancel}>
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
