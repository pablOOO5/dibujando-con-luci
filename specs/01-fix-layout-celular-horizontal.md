# SPEC 01 — Arreglar layout en celular horizontal (canvas y overlays)

> **Estado:** Aprobado · **Depende de:** — · **Fecha:** 2026-06-26
> **Objetivo:** Que en celular en horizontal el dibujo no se monte sobre las herramientas y que los overlays no queden cortados, achicando el canvas y dando scroll a los overlays cuando la pantalla es baja.

---

## Alcance

**Adentro:**

- Evitar que un **celular en horizontal** entre al layout de "tablet apaisada": agregar una condición de altura mínima a la media query `@media (orientation: landscape) and (min-width: 720px)` (sumar `and (min-height: 600px)`), para que los celus en horizontal se queden con el layout en columna que ya funciona.
- Hacer que `.canvas-wrap` **respete la altura real disponible** del `.stage` y se achique cuando haga falta, sin desbordarse nunca sobre la barra de herramientas.
- Dar **scroll y tope de altura** a los overlays (`.overlay` + `.reward-card` / `.reminder-card` / `.gate-card`) para que en pantallas bajas no se corten ni queden botones inaccesibles.
- Cambios acotados a `src/styles/global.css`.

**Fuera de alcance (para futuros specs):**

- Forzar o sugerir orientación vertical en la PWA (vía manifest `orientation` o API).
- Rediseñar las grillas de Home/Galería para horizontal (hoy scrollean bien, no se tocan).
- Reposicionar el `.del-btn` de la galería (es decorativo, no es un bug).
- Cualquier cambio en componentes `.tsx` o en la lógica del motor de colorear.

---

## Modelo de datos

Esta funcionalidad **no introduce ni modifica estructuras de datos**. Son cambios puramente de CSS/layout en `src/styles/global.css`. No toca estado, store ni persistencia.

---

## Plan de implementación

Todos los pasos son sobre `src/styles/global.css`. Cada paso deja la app funcionando.

1. **Cerrar la media query de tablet apaisada por altura.**
   En `@media (orientation: landscape) and (min-width: 720px)` agregar `and (min-height: 600px)`.
   Efecto: un celular en horizontal (alto chico) ya **no** entra a la rama de tablet y se queda con el layout en columna que no se desborda.
   _Prueba manual:_ en DevTools, viewport ~800×360 landscape → el canvas deja de montarse sobre las herramientas.

2. **Endurecer el layout en columna para que el canvas nunca desborde.**
   En `.stage` agregar `overflow: hidden`. En `.canvas-wrap` agregar `max-height: 100%` (manteniendo `aspect-ratio: 1`), así el canvas se achica al espacio real del `.stage` aunque la barra de herramientas crezca.
   _Prueba manual:_ en viewports bajos el dibujo se ve más chico pero completo, y la paleta queda siempre visible.

3. **Dar scroll y tope de altura a los overlays.**
   A `.reward-card, .reminder-card, .gate-card` agregar `max-height: calc(100dvh - 40px)` y `overflow-y: auto`.
   _Prueba manual:_ en viewport ~800×360, abrir el parent gate (Ajustes) y el festejo de "¡Listo!" → la tarjeta entra o scrollea, y los botones quedan accesibles.

---

## Criterios de aceptación

- [ ] En celular en horizontal (viewport ~800×360) en `/colorear/koala`, el dibujo **no** se monta sobre las herramientas ni la paleta.
- [ ] En ese mismo viewport, la barra de herramientas (balde/pincel/goma) y la paleta de colores quedan **completamente visibles**.
- [ ] El canvas se ve completo (no recortado) y centrado, aunque más chico que en tablet.
- [ ] En tablet apaisada (viewport ≥720×600), el layout de una sola fila (herramientas + paleta) **se mantiene igual** que antes.
- [ ] En vertical (portrait) de celular, el layout **no cambia** respecto al actual.
- [ ] En viewport ~800×360, al abrir el parent gate de Ajustes, el botón de confirmar es accesible (la tarjeta entra o scrollea).
- [ ] En viewport ~800×360, al tocar "¡Listo! 🎉", el overlay de premio muestra sus botones accesibles (entra o scrollea).
- [ ] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** gatear la media query de tablet con `min-height: 600px`. Es la causa raíz: el celular en horizontal cumplía `min-width: 720px` y entraba al layout de tablet sin tener altura para el canvas.
- **No:** forzar orientación vertical en el manifest de la PWA. Resuelve el síntoma tapando una orientación válida; queda para otro spec si alguna vez se decide.
- **Sí:** dejar que el canvas se achique (`max-height: 100%` + `overflow: hidden` en `.stage`). Prioriza que herramientas y paleta estén siempre visibles; un dibujo más chico es aceptable, targets grandes no se tocan.
- **No:** recalcular el tamaño del canvas con JS midiendo el `.stage`. Más frágil y mete lógica al ciclo de render; el CSS alcanza.
- **Sí:** dar `overflow-y: auto` + `max-height` a los overlays. Bug latente real en pantallas bajas, barato de arreglar en el mismo spec.
- **No:** rediseñar Home/Galería para horizontal ni mover el `.del-btn`. Hoy scrollean bien y el botón es decorativo; no son bugs.

---

## Qué **no** entra en este spec

- Forzar/sugerir orientación vertical en la PWA.
- Rediseño de Home/Galería para horizontal.
- Reposicionar el `.del-btn` de la galería.
- Cualquier cambio en `.tsx` o en el motor de colorear.

Cada una, si alguna vez se hace, va en su propio spec.
