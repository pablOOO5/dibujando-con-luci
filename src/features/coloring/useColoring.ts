import { useEffect, useRef, useState } from 'preact/hooks'
import { floodFill, type RGB } from './floodFill'
import { asset } from '../../lib/assets'

// Resolucion interna del canvas (apaisado 3:2). Equilibrio nitidez / memoria / velocidad
// de flood-fill para tablets y celulares modestos. Lado largo 900.
const RES_W = 900
const RES_H = 600

export type Tool = 'fill' | 'brush' | 'pencil' | 'eraser'

export function useColoring(lineArt: string, blank = false) {
  const paintRef = useRef<HTMLCanvasElement>(null)
  const outlineRef = useRef<HTMLCanvasElement>(null)
  const alphaRef = useRef<Uint8ClampedArray | null>(null) // mascara de bordes (contorno)
  const undoRef = useRef<ImageData[]>([])
  const drawingRef = useRef(false)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const [ready, setReady] = useState(false)
  const [canUndo, setCanUndo] = useState(false)

  // (Re)inicializa los canvases cuando cambia el animal.
  useEffect(() => {
    setReady(false)
    const paint = paintRef.current
    const outline = outlineRef.current
    if (!paint || !outline) return
    if (!lineArt && !blank) return // sin animal y sin modo libre: nada que inicializar
    paint.width = outline.width = RES_W
    paint.height = outline.height = RES_H
    const pctx = paint.getContext('2d')!
    pctx.fillStyle = '#ffffff'
    pctx.fillRect(0, 0, RES_W, RES_H)
    undoRef.current = []
    setCanUndo(false)

    // Modo libre: lienzo en blanco sin contorno. Mascara de bordes toda en cero
    // (sin paredes): el balde rellena la region contigua del mismo color.
    if (blank) {
      const octx = outline.getContext('2d', { willReadFrequently: true })!
      octx.clearRect(0, 0, RES_W, RES_H)
      alphaRef.current = new Uint8ClampedArray(RES_W * RES_H)
      setReady(true)
      return
    }

    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      const octx = outline.getContext('2d', { willReadFrequently: true })!
      octx.clearRect(0, 0, RES_W, RES_H)
      octx.drawImage(img, 0, 0, RES_W, RES_H)
      const data = octx.getImageData(0, 0, RES_W, RES_H).data
      const alpha = new Uint8ClampedArray(RES_W * RES_H)
      for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3]
      alphaRef.current = alpha
      setReady(true)
    }
    img.src = asset(lineArt)
    return () => {
      cancelled = true
    }
  }, [lineArt, blank])

  function toCanvas(clientX: number, clientY: number) {
    const r = paintRef.current!.getBoundingClientRect()
    return {
      x: ((clientX - r.left) / r.width) * RES_W,
      y: ((clientY - r.top) / r.height) * RES_H,
    }
  }

  function pushUndo() {
    const pctx = paintRef.current!.getContext('2d', { willReadFrequently: true })!
    undoRef.current.push(pctx.getImageData(0, 0, RES_W, RES_H))
    if (undoRef.current.length > 6) undoRef.current.shift() // deshacer acotado (RAM)
    setCanUndo(true)
  }

  function undo() {
    const snap = undoRef.current.pop()
    if (!snap) return
    paintRef.current!.getContext('2d')!.putImageData(snap, 0, 0)
    setCanUndo(undoRef.current.length > 0)
  }

  /** Balde: rellena la region tocada. Devuelve true si pinto algo. */
  function fillAt(clientX: number, clientY: number, rgb: RGB): boolean {
    if (!ready || !alphaRef.current) return false
    const { x, y } = toCanvas(clientX, clientY)
    const pctx = paintRef.current!.getContext('2d', { willReadFrequently: true })!
    const image = pctx.getImageData(0, 0, RES_W, RES_H)
    pushUndo()
    const changed = floodFill(image, alphaRef.current, x, y, rgb)
    if (changed) pctx.putImageData(image, 0, 0)
    else undoRef.current.pop() // sin cambios: descartar el snapshot
    setCanUndo(undoRef.current.length > 0)
    return changed
  }

  /** Borra toda la pintura (deshacible). Deja el contorno y la mascara intactos. */
  function reset() {
    if (!ready) return
    pushUndo()
    const pctx = paintRef.current!.getContext('2d')!
    pctx.fillStyle = '#ffffff'
    pctx.fillRect(0, 0, RES_W, RES_H)
  }

  function strokeStart(clientX: number, clientY: number, color: string, size: number) {
    if (!ready) return
    pushUndo()
    drawingRef.current = true
    const { x, y } = toCanvas(clientX, clientY)
    lastRef.current = { x, y }
    const pctx = paintRef.current!.getContext('2d')!
    pctx.fillStyle = color
    pctx.beginPath()
    pctx.arc(x, y, size / 2, 0, Math.PI * 2)
    pctx.fill()
  }

  function strokeMove(clientX: number, clientY: number, color: string, size: number) {
    if (!drawingRef.current) return
    const { x, y } = toCanvas(clientX, clientY)
    const last = lastRef.current!
    const pctx = paintRef.current!.getContext('2d')!
    pctx.strokeStyle = color
    pctx.lineWidth = size
    pctx.lineCap = 'round'
    pctx.lineJoin = 'round'
    pctx.beginPath()
    pctx.moveTo(last.x, last.y)
    pctx.lineTo(x, y)
    pctx.stroke()
    lastRef.current = { x, y }
  }

  function strokeEnd() {
    drawingRef.current = false
    lastRef.current = null
  }

  /** Compone pintura + contorno en un PNG (para guardar en la galeria). */
  function exportPng(): Promise<Blob> {
    const out = document.createElement('canvas')
    out.width = RES_W
    out.height = RES_H
    const ctx = out.getContext('2d')!
    ctx.drawImage(paintRef.current!, 0, 0)
    ctx.drawImage(outlineRef.current!, 0, 0)
    return new Promise((resolve) => out.toBlob((b) => resolve(b!), 'image/png'))
  }

  return {
    paintRef,
    outlineRef,
    ready,
    canUndo,
    fillAt,
    strokeStart,
    strokeMove,
    strokeEnd,
    undo,
    reset,
    exportPng,
    RES_W,
    RES_H,
  }
}
