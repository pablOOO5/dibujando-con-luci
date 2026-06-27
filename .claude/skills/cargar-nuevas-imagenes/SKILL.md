---
name: cargar-nuevas-imagenes
description: Detecta SVGs de dibujos nuevos en public/content/, los valida (3:2, sin fondo opaco), confirma categoría/nombre/emoji con el usuario, crea una rama nueva desde main y los agrega al manifest. Soporta categorías nuevas (cada una en su carpeta). Referencia metodológica: specs/05-cargar-animales-pendientes.md.
disable-model-invocation: true
argument-hint: '(opcional) carpeta o categoría a cargar, ej. mcdonalds'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node:*), Bash(npm run typecheck:*), Bash(npm run build:*), Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git pull:*)
---

# /cargar-nuevas-imagenes — Cargar dibujos nuevos al juego

Esta skill agrega al juego dibujos que el usuario ya dejó como **SVG line-art** en
`public/content/`, validando que cada uno sirva para el motor de colorear y escribiéndolos en
`public/content/manifest.json`. Es la versión reutilizable de lo que se hizo en
[`specs/05-cargar-animales-pendientes.md`](../../../specs/05-cargar-animales-pendientes.md) —
leelo si necesitás el "por qué" de cada regla.

El contenido es **data-driven**: los dibujos no se hardcodean, viven en el manifest
(`categories[]` con `id/name/emoji`; `animals[]` con `id/name/categoryId/lineArt/favorite?`).
El motor (`src/features/coloring/`) necesita SVG **3:2 con fondo transparente**: las líneas
oscuras son las "paredes" del flood-fill, y un fill blanco de área completa actúa como fondo
y **bloquea el balde**. Formato correcto: [`docs/medidas-de-los-dibujos.md`](../../../docs/medidas-de-los-dibujos.md).

## Reglas duras (leer antes de empezar)

- **No modificar ni reescribir SVGs.** Si uno no valida, se reporta y se deja afuera; lo arregla el usuario aparte. Nunca le saques el fondo ni "limpies" la traza vos.
- **No vectorizar imágenes crudas.** La entrada son SVGs ya listos. Si el usuario dejó PNG/JPG, frená y mandalo a `docs/medidas-de-los-dibujos.md` (vectorizar + quitar fondo es paso manual previo).
- **No commitear, no pushear, no levantar el dev server.** Eso lo hace el usuario (workflow del proyecto). Vos editás archivos, **creás/cambiás de rama** (eso sí es parte del flujo, no es commit ni push) y corrés `typecheck`/`build` nomás.
- **Nunca trabajar sobre `main`.** Antes de escribir nada, siempre creás una rama nueva **desde `main`** (ver Fase 4). Nunca editás el manifest directamente sobre `main` ni encadenás cambios sobre una rama vieja.
- **No tocar lo existente.** No reordenes ni renombres categorías ya presentes, no cambies `favorite` de nadie (hoy solo `koala`), no toques dibujos ya cargados.
- **Confirmar SIEMPRE** categoría, nombre y emoji con el usuario antes de escribir el manifest.
- **Una categoría nueva ⇒ una carpeta nueva** bajo `public/content/` (ej. `public/content/mcdonalds/`). El `name` de cada dibujo sale del **nombre del archivo** (`serpiente.svg` ⇒ "Serpiente"); ajustá acentos/mayúscula del español.

## Flujo (fases con pausas)

Seguí las fases en orden y **pausá después de cada una** para que el usuario revise, igual que
`/spec-impl`. No avances si la anterior no quedó bien.

### Fase 1 — Detectar dibujos nuevos

Corré el validador incluido en esta skill, que escanea `public/content/**/*.svg`, descarta los
que ya están en el manifest (por `lineArt`) y reporta solo los nuevos:

```bash
node .claude/skills/cargar-nuevas-imagenes/validar-svgs.mjs
```

Si el usuario pasó un argumento (carpeta/categoría, ej. `mcdonalds`), acotá:
`node .claude/skills/cargar-nuevas-imagenes/validar-svgs.mjs mcdonalds`.

Si no hay dibujos nuevos, decílo y terminá. Si los hay, mostrá la tabla `validos / a revisar`.

### Fase 2 — Interpretar la validación

El script ya aplica las dos reglas: **3:2** (ratio ~1.5, ±2%) y **sin fondo opaco** (sin
`<rect>` y sin fill blanco con bbox > 90% del canvas). Para cada SVG devuelve `verdict`
(`valido` / `a-revisar`) y `motivo`. Resumí al usuario:

- **Válidos:** candidatos a cargar.
- **A revisar:** NO se cargan; van al reporte de pendientes (Fase 6) con su motivo.

Si un SVG tiene traza ruidosa (muchos fills oscuros) pero pasa el chequeo estático, marcá que
queda **a confirmar con el balde** en la Fase 7 (caso `abeja`/`gato` de SPEC 05).

### Fase 3 — Confirmar categoría, nombre y emoji

Para cada SVG **válido**, proponé en una tabla:

- `id` = nombre del archivo (slug, sin extensión). `name` = ese nombre capitalizado y **con
  acentos del español** (ej. `leon`→"León", `pinguino`→"Pingüino").
- `categoryId`: si el SVG está en una carpeta que mapea a una categoría existente, usala; si
  es un tema nuevo, **proponé una categoría nueva** (`id` kebab-case, `name`, `emoji` acorde,
  ej. McDonald's → 🍟, escuela → 🎒) cuya **carpeta** sea `public/content/<categoria>/`.
- Avisá si un SVG quedó en una carpeta que no coincide con su categoría propuesta.

**Mostrá la tabla y esperá confirmación o correcciones.** No escribas nada hasta que el
usuario apruebe el mapeo completo (categorías nuevas + cada dibujo).

### Fase 4 — Crear la rama de git (desde `main`)

Recién acá empezás a tocar el repo. **Solo cuando ya hay contenido válido y el usuario aprobó
el mapeo de la Fase 3** (así la rama tiene nombre por categoría y no se crean ramas vacías).
Análogo a la Fase 3 de `/spec-impl`.

1. **Guardia previa:** corré `git status --short`. Los SVG nuevos suelen estar *untracked*
   (eso está OK: sobreviven al cambio de rama). Pero si hay **archivos trackeados modificados**
   sin commitear, **frená** y avisá al usuario para que decida — no arrastres cambios ajenos a
   `main`. No sigas hasta que el árbol esté limpio (salvo los untracked de los dibujos).
2. **Partí de `main`:** `git checkout main`. Si hay remoto/conexión, actualizalo con
   `git pull --ff-only`. Si el pull falla (offline o sin remoto), avisalo y seguí con el `main`
   local — no es bloqueante.
3. **Derivá el nombre** de la(s) categoría(s) que cargás, en kebab-case:
   `nuevas-imagenes-<categoria>` (ej. `nuevas-imagenes-mcdonalds`). Si cargás varias
   categorías, combinalas: `nuevas-imagenes-<cat1>-<cat2>`.
4. **Creá / cambiá de rama** (mismo manejo que `/spec-impl`):
   - Si **no existe**: `git checkout -b nuevas-imagenes-<categoria>`.
   - Si **ya existe**: avisá que existía (puede ser retomar trabajo) y `git checkout` a ella.
   - En ambos casos: confirmá que el cambio fue exitoso (`git branch --show-current`) antes de
     continuar.
5. **Confirmación visual** al usuario y pausá, como el resto de fases:

   ```
   ✅ Rama lista, recién ahora escribo archivos.

   Rama base:   main
   Rama nueva:  nuevas-imagenes-<categoria>  (activa)
   ```

### Fase 5 — Escribir el manifest

En `public/content/manifest.json`:

- Agregá las **categorías nuevas al final** de `categories[]` (sin tocar las existentes).
- Agregá las entradas de dibujos válidos a `animals[]` con `id`, `name`, `categoryId` y
  `lineArt` = `/content/<carpeta>/<id>.svg` (ruta con `/` inicial, como el resto). Sin
  `favorite` salvo que el usuario lo pida explícito.
- Validá que el JSON siga bien: `node -e "JSON.parse(require('fs').readFileSync('public/content/manifest.json','utf8')); console.log('JSON OK')"`.

### Fase 6 — Reporte de pendientes

Registrá los SVG **a revisar** (los que no validaron) y su motivo en
`docs/dibujos-pendientes.md` (creálo si no existe; es el equivalente genérico de
`docs/animales-pendientes.md`). Para cada uno: archivo, categoría prevista y motivo
(fondo opaco, ratio, etc.), más un recordatorio de cómo arreglarlo (quitar el fondo blanco,
ver `docs/medidas-de-los-dibujos.md`).

### Fase 7 — Verificación

- Corré `npm run typecheck` y `npm run build`. Ambos deben pasar.
- **Recordale al usuario** que pruebe manualmente el **balde por cada dibujo nuevo**
  (`/colorear/<id>`): que rellene por región y no se escape ni quede bloqueado. El server lo
  levanta él. Si alguno falla el balde, **sacalo del manifest** y mandalo a pendientes (Fase 6).
- Cerrá con un resumen: **rama creada** (`nuevas-imagenes-<categoria>`), categorías agregadas,
  dibujos cargados y pendientes. Recordale al usuario que el **commit, el push y el PR** los
  hace él (los cambios ya quedaron en la rama nueva, no en `main`).

## Notas

- El validador (`validar-svgs.mjs`) usa un heurístico de bounding box para el fill blanco;
  asume coordenadas absolutas (como los SVG autotrazados del proyecto). Si algún SVG usa
  coordenadas relativas y el resultado parece raro, confirmá con el balde antes de descartar.
- Categorías sin dibujos no rompen Home (el loader filtra por `categoryId`), pero evitá dejar
  una categoría nueva vacía: si todos sus SVG cayeron en "a revisar", no la crees todavía.
