import { useEffect, useRef, useState } from 'preact/hooks'
import { useLocation } from 'preact-iso'
import { loadContent, findAnimal } from '../content/loader'
import type { Animal } from '../types'
import { useColoring, type Tool } from '../features/coloring/useColoring'
import { PALETTE, hexToRgb } from '../features/coloring/palette'
import { RewardOverlay } from '../features/rewards/RewardOverlay'
import { saveDrawing } from '../features/gallery/db'
import { useSettings } from '../store/settings'
import { playPop, playSuccess } from '../lib/sound'

const BRUSH_SIZE = 26
const ERASER_SIZE = 52

export function Coloring({ id }: { id?: string }) {
  const { route } = useLocation()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    loadContent().then((c) => {
      const a = findAnimal(c, id)
      if (a) setAnimal(a)
      else setNotFound(true)
    })
  }, [id])

  const c = useColoring(animal?.lineArt ?? '')
  const [tool, setTool] = useState<Tool>('fill')
  const [color, setColor] = useState(PALETTE[0].hex)
  const [reward, setReward] = useState(false)
  const [saved, setSaved] = useState(false)

  const sound = useSettings((s) => s.sound)
  const celebrate = useSettings((s) => s.celebrate)

  const pending = useRef<{ x: number; y: number } | null>(null)
  const raf = useRef<number | undefined>(undefined)

  const strokeColor = () => (tool === 'eraser' ? '#ffffff' : color)
  const strokeSize = () => (tool === 'eraser' ? ERASER_SIZE : BRUSH_SIZE)

  function onPointerDown(e: PointerEvent) {
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    if (tool === 'fill') {
      const changed = c.fillAt(e.clientX, e.clientY, hexToRgb(color))
      if (changed && sound) playPop()
    } else {
      c.strokeStart(e.clientX, e.clientY, strokeColor(), strokeSize())
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (tool === 'fill') return
    pending.current = { x: e.clientX, y: e.clientY }
    if (raf.current === undefined) {
      raf.current = requestAnimationFrame(() => {
        raf.current = undefined
        const p = pending.current
        if (p) c.strokeMove(p.x, p.y, strokeColor(), strokeSize())
      })
    }
  }

  function onPointerUp() {
    c.strokeEnd()
  }

  function finish() {
    if (celebrate) {
      if (sound) playSuccess()
      setReward(true)
    } else {
      route('/')
    }
  }

  async function doSave() {
    if (!animal) return
    const blob = await c.exportPng()
    await saveDrawing(animal.id, animal.name, blob)
    setSaved(true)
  }

  if (notFound) {
    return (
      <div class="loading">
        <p>No encontré ese dibujo 🙈</p>
        <button class="btn-big primary" onClick={() => route('/')}>Volver</button>
      </div>
    )
  }

  return (
    <div class="coloring">
      <header class="tool-top">
        <button class="icon-btn" onClick={() => route('/')} aria-label="Volver">←</button>
        <button class="icon-btn" onClick={c.undo} disabled={!c.canUndo} aria-label="Deshacer">↩️</button>
        <span class="coloring-title">{animal?.name ?? ''}</span>
        <button class="btn-listo" onClick={finish} disabled={!c.ready}>¡Listo! 🎉</button>
      </header>

      <div class="stage">
        <div
          class="canvas-wrap"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas ref={c.paintRef} class="layer" />
          <canvas ref={c.outlineRef} class="layer outline" />
          {!c.ready && <div class="canvas-loading">Cargando…</div>}
        </div>
      </div>

      <div class="tool-bottom">
        <div class="tools" role="toolbar" aria-label="Herramientas">
          <button class={`tool ${tool === 'fill' ? 'active' : ''}`} onClick={() => setTool('fill')} aria-label="Balde">🪣</button>
          <button class={`tool ${tool === 'brush' ? 'active' : ''}`} onClick={() => setTool('brush')} aria-label="Pincel">🖌️</button>
          <button class={`tool ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} aria-label="Goma">🧽</button>
        </div>
        <div class="palette" role="listbox" aria-label="Colores">
          {PALETTE.map((p) => (
            <button
              key={p.hex}
              class={`swatch ${color === p.hex ? 'active' : ''}`}
              style={`background:${p.hex}`}
              aria-label={p.name}
              onClick={() => {
                setColor(p.hex)
                if (tool === 'eraser') setTool('fill')
              }}
            />
          ))}
        </div>
      </div>

      {reward && (
        <RewardOverlay
          saved={saved}
          onSave={doSave}
          onClose={() => {
            setReward(false)
            route('/')
          }}
        />
      )}
    </div>
  )
}
