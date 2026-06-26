// Sonidos generados con Web Audio (sin archivos de audio = mas liviano y offline).
// Suaves a proposito (sensorial). El llamador decide segun el ajuste de sonido.

let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  // En moviles el contexto arranca "suspended" hasta el primer toque.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  const c = ac()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = c.currentTime + start
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

/** Toque corto y amable al pintar. */
export function playPop() {
  tone(520, 0, 0.12, 'triangle', 0.1)
}

/** Arpegio alegre al completar un dibujo. */
export function playSuccess() {
  const notes = [523, 659, 784, 1047] // Do Mi Sol Do
  notes.forEach((f, i) => tone(f, i * 0.12, 0.28, 'sine', 0.13))
}

/** Aviso suave del recordatorio de bano (dos tonos amables). */
export function playReminder() {
  tone(660, 0, 0.35, 'sine', 0.12)
  tone(880, 0.3, 0.4, 'sine', 0.12)
}
