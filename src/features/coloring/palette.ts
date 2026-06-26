import type { RGB } from './floodFill'

export interface Color {
  name: string
  hex: string
}

// Paleta amplia y amigable para nenes. El blanco sirve para "despintar" un area.
export const PALETTE: Color[] = [
  { name: 'Rojo', hex: '#e23b3b' },
  { name: 'Naranja', hex: '#f4922b' },
  { name: 'Amarillo', hex: '#ffd23e' },
  { name: 'Verde', hex: '#5bbf3a' },
  { name: 'Celeste', hex: '#39c0d8' },
  { name: 'Azul', hex: '#3a6fd8' },
  { name: 'Violeta', hex: '#8a4fd8' },
  { name: 'Rosa', hex: '#e85aa8' },
  { name: 'Marron', hex: '#8a5a2b' },
  { name: 'Gris', hex: '#9aa0a8' },
  { name: 'Negro', hex: '#3a3a3a' },
  { name: 'Blanco', hex: '#ffffff' },
]

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}
