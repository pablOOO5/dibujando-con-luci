// Flood-fill iterativo por scanline (NO recursivo: rapido y sin stack overflow,
// pensado para hardware modesto). Rellena la region conectada del canvas de pintura
// frenando en las lineas negras del contorno (mascara de alpha).

export type RGB = [number, number, number]

export function floodFill(
  paint: ImageData,
  /** Alpha del contorno por pixel (0..255). > umbral = pared. */
  outlineAlpha: Uint8ClampedArray,
  startX: number,
  startY: number,
  fill: RGB,
): boolean {
  const { width, height, data } = paint
  const x0 = Math.floor(startX)
  const y0 = Math.floor(startY)
  if (x0 < 0 || y0 < 0 || x0 >= width || y0 >= height) return false

  const WALL = 110
  const at = (x: number, y: number) => y * width + x

  // No pintar si arrancamos sobre una linea del contorno.
  if (outlineAlpha[at(x0, y0)] > WALL) return false

  const s = at(x0, y0) * 4
  const tr = data[s], tg = data[s + 1], tb = data[s + 2], ta = data[s + 3]
  const [fr, fg, fb] = fill
  // Ya esta del color destino: nada que hacer.
  if (tr === fr && tg === fg && tb === fb && ta === 255) return false

  const matches = (x: number, y: number): boolean => {
    const p = at(x, y)
    if (outlineAlpha[p] > WALL) return false
    const d = p * 4
    return data[d] === tr && data[d + 1] === tg && data[d + 2] === tb && data[d + 3] === ta
  }
  const paintPixel = (x: number, y: number) => {
    const d = at(x, y) * 4
    data[d] = fr
    data[d + 1] = fg
    data[d + 2] = fb
    data[d + 3] = 255
  }

  const stack: number[] = [x0, y0]
  while (stack.length) {
    const y = stack.pop()!
    const sx = stack.pop()!
    // Extender el segmento horizontal.
    let lx = sx
    while (lx > 0 && matches(lx - 1, y)) lx--
    let rx = sx
    while (rx < width - 1 && matches(rx + 1, y)) rx++

    let spanUp = false
    let spanDown = false
    for (let x = lx; x <= rx; x++) {
      paintPixel(x, y)
      if (y > 0) {
        const up = matches(x, y - 1)
        if (up && !spanUp) stack.push(x, y - 1)
        spanUp = up
      }
      if (y < height - 1) {
        const down = matches(x, y + 1)
        if (down && !spanDown) stack.push(x, y + 1)
        spanDown = down
      }
    }
  }
  return true
}
