# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

"Dibujando con Luci" es una **PWA** (app web instalable) para colorear animales, pensada para
jugar en tablet y celular. Reemplaza juegos pagos de la Play Store. La usa **Luci** (una nena
con autismo): el diseño es deliberadamente simple, predecible, con targets grandes y todo lo
sensorial (sonido/festejo) es desactivable. UI en español.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # desarrollo (http://localhost:5173)
npm run build      # tsc -b + vite build  -> dist/
npm run preview    # servir el build de producción (probar la PWA real)
npm run typecheck  # solo chequeo de tipos
```

No hay tests configurados todavía. La verificación es manual (ver "Verificación" abajo).

## Stack y por qué

- **Preact + Vite + TypeScript** — se eligió Preact (no React) **a propósito por hardware
  limitado**: runtime ~3KB y mejor arranque/RAM en tablets/celulares modestos. `tsconfig` y
  `@preact/preset-vite` aliasan `react`/`react-dom` a `preact/compat`, por eso **zustand**
  (que importa de `react`) funciona sin cambios.
- **vite-plugin-pwa** — manifest + service worker + offline + "agregar a inicio".
- **preact-iso** — router liviano.
- **zustand** — estado global de ajustes.
- **idb** — galería de dibujos en IndexedDB.

## Arquitectura (lo que conviene entender antes de tocar)

### Contenido data-driven — NO hardcodear animales
Las categorías y animales viven en **`public/content/manifest.json`**, no en el código.
`src/content/loader.ts` lo carga (con caché) y ofrece `animalsByCategory`, `findAnimal`,
`findCategory`. Los animales son **SVG line-art** (`public/content/animals/*.svg`): contorno
negro con `stroke`, `fill="none"` y fondo transparente. Las categorías usan **emoji** como
ícono (sin assets). Ver "Cómo agregar un animal".

### Motor de colorear — el núcleo, y dónde está la performance
Todo el peso real está en el canvas, no en el framework. Vive en
`src/features/coloring/`:

- **`useColoring.ts`** — hook con la lógica imperativa. Usa **dos canvas apilados**: la capa
  de **pintura** (abajo) y la capa de **contorno** (arriba, `pointer-events:none`) que se
  rasteriza desde el SVG. El contorno siempre queda nítido encima de los rellenos. Al cargar
  un animal, calcula `outlineAlpha` (alpha por píxel) que sirve de **máscara de bordes**.
  Expone `fillAt` (balde), `strokeStart/Move/End` (pincel/goma), `undo`, `exportPng`.
  Resolución interna fija `RES = 900`. **Deshacer acotado a 6 snapshots** (RAM).
- **`floodFill.ts`** — flood-fill **iterativo por scanline** (no recursivo, clave para no
  crashear ni trabar el hardware modesto). Frena en píxeles cuyo `outlineAlpha > 110`.
- Reglas de performance que NO hay que romper: canvas fuera del ciclo de render de Preact
  (todo por refs), eventos de `pointermove` coalescidos con `requestAnimationFrame` (en
  `pages/Coloring.tsx`), nada de librerías de animación (el festejo es CSS).

### Pantallas y navegación
Rutas en `src/app.tsx` (preact-iso). Las páginas están en `src/pages/`:
`Home` (categorías + grilla), `Coloring` (`/colorear/:id`, los params llegan como props),
`Gallery` (`/galeria`), `Settings` (`/ajustes`). El recordatorio de baño es **global**
(corre en `App` vía `useBathroomReminder`, no por pantalla).

### Ajustes, premios y accesibilidad
- `src/store/settings.ts` — zustand + `localStorage`: `sound`, `celebrate`,
  `reminderEnabled`, `reminderMinutes`.
- `Settings` está detrás de un **parent gate** (`components/ParentGate.tsx`, una suma) para
  que Luci no cambie los ajustes sin querer.
- `features/rewards/RewardOverlay.tsx` — festejo "terminaste la tarea → premio" con sus
  favoritos (koala 🐨 / papas 🍟 / hamburguesa 🍔). Marco pedagógico de los padres.
- `features/reminder/` — recordatorio de baño suave y configurable (Luci a veces se olvida).
- `lib/sound.ts` — sonidos por **Web Audio** (sin archivos de audio); siempre condicionados
  al ajuste `sound`.

### Rutas de assets
Siempre resolver con `asset()` de `src/lib/assets.ts` (respeta `BASE_URL` para deploys en
subdirectorio, p.ej. GitHub Pages). El manifest guarda rutas con `/` inicial.

## Cómo agregar un animal (caso más común)
> Medidas y formato correcto del dibujo (apaisado **3:2**, `viewBox 0 0 600 400`, fondo
> transparente, qué se deforma y un prompt para generarlo): ver
> [`docs/medidas-de-los-dibujos.md`](docs/medidas-de-los-dibujos.md).

1. Crear `public/content/animals/<id>.svg`: contorno negro (`stroke="#1a1a1a"`,
   `stroke-width` ~7), `fill="none"`, **fondo transparente**, `viewBox="0 0 600 400"`
   (apaisado 3:2). Cada región a colorear debe estar **cerrada por trazos** (si no, el
   balde "se escapa"). Pupilas/detalles negros pueden ir con `fill="#1a1a1a" stroke="none"`.
2. Agregar una entrada en `public/content/manifest.json` (`id`, `name`, `categoryId`,
   `lineArt`; `favorite:true` lo destaca y lo pone primero).
3. Listo: aparece solo, sin tocar código.

**Nueva categoría**: agregar a `categories` (`id`, `name`, `emoji`).
**Nuevo juego (a futuro)**: agregar un módulo en `src/features/` + una ruta en `app.tsx`; el
Home puede listar varios juegos. La estructura ya está pensada para crecer.

## Verificación
1. `npm run dev`, probar en escritorio + modo dispositivo del navegador, y en la tablet real
   (misma red: `npm run dev -- --host`, o la URL deployada).
2. Flujo: categoría → koala → balde rellena por región, pincel/goma pintan bajo las líneas,
   deshacer funciona → "¡Listo!" → festejo → Guardar → aparece en la galería.
3. Recordatorio: en Ajustes poner 5 min y esperar el aviso.
4. PWA: `npm run build && npm run preview`, instalar ("agregar a pantalla de inicio") y
   verificar que **funciona offline**.
