#!/usr/bin/env node
// Validador de SVGs para "cargar-nuevas-imagenes".
// Escanea public/content/**/*.svg, descarta los que ya estan en el manifest
// y reporta cuales sirven para el motor de colorear y cuales no.
//
// Reglas (ver specs/05-cargar-animales-pendientes.md):
//   - Proporcion 3:2 (ratio ~1.5, tolerancia +-2%), de viewBox o width/height.
//   - Sin fondo opaco: sin <rect> de fondo y sin fill blanco/casi-blanco cuyo
//     bounding box cubra un area grande (>90%) del canvas (bloquearia el balde).
//
// Uso:
//   node .claude/skills/cargar-nuevas-imagenes/validar-svgs.mjs [carpeta]
// donde [carpeta] (opcional) acota a public/content/<carpeta>/ (ej. mcdonalds).
//
// NO modifica ningun SVG. Solo lee y reporta (texto + bloque JSON).

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, basename, sep } from 'node:path'

const CONTENT_DIR = join('public', 'content')
const MANIFEST = join(CONTENT_DIR, 'manifest.json')
const RATIO_TARGET = 1.5
const RATIO_TOL = 0.02 // +-2%
const WHITE_BG_PCT = 90 // un fill blanco con bbox > 90% del canvas = fondo opaco
const folderFilter = process.argv[2] || null

/** Lista recursiva de .svg bajo un directorio. */
function listSvgs(dir) {
  const out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listSvgs(full))
    else if (name.toLowerCase().endsWith('.svg')) out.push(full)
  }
  return out
}

/** Ruta tal como aparece en lineArt del manifest: "/content/<...>". */
function toContentPath(fullPath) {
  return '/' + relative('public', fullPath).split(sep).join('/')
}

/** Capitaliza la primera letra (sugerencia de name; los acentos los pone el humano). */
function suggestName(id) {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

function isWhite(fill) {
  if (!fill) return false
  const rgb = fill.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)
  if (rgb) return +rgb[1] >= 245 && +rgb[2] >= 245 && +rgb[3] >= 245
  const hex6 = fill.match(/^#([0-9a-f]{6})$/i)
  if (hex6) {
    const r = parseInt(hex6[1].slice(0, 2), 16)
    const g = parseInt(hex6[1].slice(2, 4), 16)
    const b = parseInt(hex6[1].slice(4, 6), 16)
    return r >= 245 && g >= 245 && b >= 245
  }
  const hex3 = fill.match(/^#([0-9a-f]{3})$/i)
  if (hex3) return /^[f]{3}$/i.test(hex3[1])
  return /^(white)$/i.test(fill.trim())
}

/** Analiza un SVG y devuelve su veredicto. */
function analyze(fullPath) {
  const s = readFileSync(fullPath, 'utf8')
  const id = basename(fullPath, '.svg')
  const folder = relative('public', fullPath).split(sep).slice(1, -1).pop() || ''

  // Dimensiones: viewBox o width/height.
  let W, H
  const vb = s.match(/viewBox="([^"]+)"/)
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/).map(Number)
    W = p[2]; H = p[3]
  } else {
    W = Number((s.match(/\bwidth="([0-9.]+)"/) || [])[1])
    H = Number((s.match(/\bheight="([0-9.]+)"/) || [])[1])
  }
  const ratio = H > 0 ? W / H : NaN
  const ratioOk = Number.isFinite(ratio) && Math.abs(ratio - RATIO_TARGET) <= RATIO_TARGET * RATIO_TOL
  const canvas = W * H

  // Fondo opaco: <rect> o fill blanco de area grande.
  const hasRect = /<rect\b/i.test(s)
  let maxWhiteBBox = 0
  const pathRe = /<path\b[^>]*>/gi
  let m
  while ((m = pathRe.exec(s))) {
    const tag = m[0]
    const fill = (tag.match(/fill="([^"]*)"/i) || [])[1] || ''
    if (!isWhite(fill)) continue
    const d = (tag.match(/\bd="([^"]*)"/i) || [])[1] || ''
    const nums = d.match(/-?\d*\.?\d+/g) || []
    const xs = [], ys = []
    for (let i = 0; i + 1 < nums.length; i += 2) { xs.push(+nums[i]); ys.push(+nums[i + 1]) }
    if (!xs.length || !canvas) continue
    const bw = Math.max(...xs) - Math.min(...xs)
    const bh = Math.max(...ys) - Math.min(...ys)
    const frac = (bw * bh) / canvas
    if (frac > maxWhiteBBox) maxWhiteBBox = frac
  }
  const maxWhiteBBoxPct = Math.round(maxWhiteBBox * 100)

  let verdict = 'valido'
  let motivo = ''
  if (!ratioOk) {
    verdict = 'a-revisar'
    motivo = `ratio ${Number.isFinite(ratio) ? ratio.toFixed(3) : 'NA'} (no es 3:2 / 1.5)`
  } else if (hasRect) {
    verdict = 'a-revisar'
    motivo = 'tiene <rect> de fondo (fondo opaco)'
  } else if (maxWhiteBBoxPct > WHITE_BG_PCT) {
    verdict = 'a-revisar'
    motivo = `fill blanco cubre ${maxWhiteBBoxPct}% del canvas (fondo opaco que bloquea el balde)`
  }

  return {
    path: fullPath.split(sep).join('/'),
    contentPath: toContentPath(fullPath),
    folder,
    id,
    suggestedName: suggestName(id),
    ratio: Number.isFinite(ratio) ? +ratio.toFixed(3) : null,
    ratioOk,
    hasRect,
    maxWhiteBBoxPct,
    verdict,
    motivo,
  }
}

// ---- main ----
let manifest
try {
  manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
} catch (e) {
  console.error(`No se pudo leer ${MANIFEST}: ${e.message}`)
  process.exit(1)
}
const loaded = new Set((manifest.animals || []).map((a) => a.lineArt))

const scanDir = folderFilter ? join(CONTENT_DIR, folderFilter) : CONTENT_DIR
const all = listSvgs(scanDir)
const nuevos = all.filter((p) => !loaded.has(toContentPath(p)))

const results = nuevos.map(analyze)
const validos = results.filter((r) => r.verdict === 'valido')
const aRevisar = results.filter((r) => r.verdict === 'a-revisar')

console.log(`\nEscaneado: ${scanDir}`)
console.log(`SVGs nuevos (no en manifest): ${results.length}  |  validos: ${validos.length}  |  a revisar: ${aRevisar.length}\n`)

const pad = (s, n) => String(s).padEnd(n)
if (results.length) {
  console.log(pad('estado', 11) + pad('id', 16) + pad('carpeta', 12) + pad('ratio', 8) + 'motivo')
  console.log('-'.repeat(70))
  for (const r of [...validos, ...aRevisar]) {
    const mark = r.verdict === 'valido' ? 'OK' : 'REVISAR'
    console.log(pad(mark, 11) + pad(r.id, 16) + pad(r.folder, 12) + pad(r.ratio ?? 'NA', 8) + (r.motivo || ''))
  }
} else {
  console.log('No hay dibujos nuevos para cargar.')
}

console.log('\n--- JSON ---')
console.log(JSON.stringify({ scanDir, total: results.length, validos, aRevisar }, null, 2))
