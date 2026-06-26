# SPEC 02 — Layout lateral del canvas en tablet apaisada

> **Estado:** aprobado · **Depende de:** SPEC 01 · **Fecha:** 2026-06-26
> **Objetivo:** Que en tablet apaisada las acciones queden en una columna a la izquierda y los colores + herramientas en una franja a la derecha, con el dibujo centrado, replicando el layout de la app de referencia.

---

## Alcance

**Adentro:**

- Solo **tablet apaisada** (`@media (orientation: landscape) and (min-width: 720px) and (min-height: 600px)`): reorganizar el layout de `/colorear/:id` a tres zonas — **columna izquierda** (acciones), **canvas centrado**, **franja derecha** (colores + herramientas).
- **Columna izquierda:** volver (←) arriba, deshacer (↩️) en el medio, "¡Listo! 🎉" al pie. Sin título del animal.
- **Franja derecha:** la **paleta de colores** pegada al canvas y las **herramientas** (balde/pincel/goma) en el borde exterior, como en la imagen de referencia.
- La paleta de colores en la franja derecha **scrollea verticalmente** si no entran todos los swatches (sin achicar los targets).
- El layout se logra **solo con CSS**: el DOM actual (`tool-top` / `.stage` / `.tool-bottom`) ya está en el orden izquierda/centro/derecha.
- Cambios acotados a `src/styles/global.css`.

**Fuera de alcance (para futuros specs):**

- Botón **tacho de basura** (reiniciar el dibujo desde cero) — feature nueva, va en otro spec.
- Botón **cámara** (guardar captura de pantalla en el dispositivo) — feature nueva, va en otro spec.
- **Forzar la orientación apaisada** en la PWA (manifest/API).
- El layout de **celular** (vertical y horizontal): no se toca, mantiene barra arriba + barra abajo con título y "¡Listo!".
- Cualquier cambio en el motor de colorear (`useColoring`, `floodFill`) o en el flujo de premios/galería.
- Calcar los colores de los paneles de la referencia (azul/madera); se mantiene el tema violeta de la app.

---

## Modelo de datos

Esta funcionalidad **no introduce ni modifica estructuras de datos**. Son cambios puramente de CSS/layout en `src/styles/global.css`. No toca estado, store, persistencia ni el motor de colorear. Reutiliza todo el modelo y la lógica existentes (`useColoring`, `PALETTE`, `RewardOverlay`, `saveDrawing`).

---

## Plan de implementación

Todos los pasos son sobre `src/styles/global.css`, dentro del bloque `@media (orientation: landscape) and (min-width: 720px) and (min-height: 600px)` (se reemplaza su contenido actual). El celular no matchea esa query, así que no se afecta.

1. **Poner `.coloring` en fila.** `flex-direction: row`. Efecto: los tres bloques quedan lado a lado (acciones izq · canvas centro · herramientas der).
   _Prueba manual:_ viewport 1024×768 → se ven tres columnas.

2. **Columna izquierda (`.tool-top`).** `flex-direction: column`, ancho fijo, `.coloring-title { display: none }`, y `.btn-listo { margin-top: auto }` para empujarlo al pie. Volver (←) arriba, deshacer (↩️) debajo, "¡Listo! 🎉" al fondo.
   _Prueba manual:_ las tres acciones quedan apiladas, sin título.

3. **Franja derecha (`.tool-bottom`).** Ancho fijo, `flex-direction: row-reverse` (así la paleta queda pegada al canvas y las herramientas en el borde exterior, como en la referencia). Dentro: `.palette` como columna scrollable (`flex-direction: column; flex-wrap: nowrap; overflow-y: auto; max-height: 100%`) y `.tools` como columna (`flex-direction: column`).
   _Prueba manual:_ con muchos colores, la paleta scrollea vertical sin achicar swatches; las herramientas quedan a la derecha del todo.

4. **Canvas centrado (`.stage` / `.canvas-wrap`).** El `.stage` toma el espacio entre columnas (`flex: 1`) y el `.canvas-wrap` se dimensiona por la altura disponible (`width: min(Nvw, calc(100dvh - margen))`, `aspect-ratio: 1`, centrado). Reemplaza el `width: min(70vw, …)` anterior.
   _Prueba manual:_ el dibujo se ve completo, cuadrado y centrado entre ambas columnas.

5. **Verificación cruzada de que el celular no cambió.** Confirmar en viewports de celular (vertical y ~800×360 horizontal) que el layout sigue siendo barra-arriba / canvas / barra-abajo con título y "¡Listo!".

---

## Criterios de aceptación

- [ ] En tablet apaisada (viewport ~1024×768) en `/colorear/koala`, las acciones quedan en una **columna a la izquierda**: volver (←) arriba, deshacer (↩️) en el medio, "¡Listo! 🎉" al pie.
- [ ] El **título del animal no se muestra** en ese layout.
- [ ] Los **colores quedan pegados al canvas** y las **herramientas (balde/pincel/goma) en el borde derecho exterior**.
- [ ] El **canvas se ve completo, cuadrado y centrado** entre ambas columnas.
- [ ] Si los colores no entran a lo alto, la **paleta scrollea verticalmente** y los swatches **no se achican**.
- [ ] El botón "¡Listo! 🎉" sigue disparando el festejo y el guardado en galería igual que antes.
- [ ] En celular vertical, el layout **no cambia** (barra arriba + canvas + barra abajo, con título y "¡Listo!").
- [ ] En celular horizontal (~800×360), el layout **no cambia** respecto al SPEC 01.
- [ ] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** reutilizar el DOM existente (`tool-top` / `.stage` / `.tool-bottom`) y resolver todo en CSS. Ya están en el orden correcto izquierda/centro/derecha; tocar `.tsx` sería riesgo sin beneficio.
- **No:** reestructurar `Coloring.tsx`. Se evaluó al principio, pero el DOM actual ya alcanza.
- **Sí:** `row-reverse` en la franja derecha para que la paleta quede pegada al canvas y las herramientas afuera, sin reordenar el DOM.
- **Sí:** mantener "¡Listo! 🎉" reubicado al pie de la columna izquierda. Es el único disparador del festejo + guardado; quitarlo dejaría la app a medias en tablet.
- **No:** quitar "¡Listo!" y delegar el guardado al futuro botón cámara. Rompe una función existente antes de tener el reemplazo.
- **Sí:** paleta scrollable vertical en vez de achicar swatches. Los targets grandes son clave para Luci (accesibilidad).
- **No:** agregar ahora el tacho (reiniciar) y la cámara (captura). Son features nuevas; este spec es solo layout.
- **No:** forzar orientación apaisada en la PWA. Queda para otro spec (mencionado como idea a futuro).
- **No:** cambiar los colores de los paneles para calcar la referencia (azul/madera). Se mantiene el tema violeta de la app; "replicar" es la disposición, no la paleta de la otra app.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| En tablets angostas (cerca de 720px de ancho) las dos columnas + el canvas podrían apretarse o solaparse, como pasó en el SPEC 01. | El `.canvas-wrap` se dimensiona por altura (`calc(100dvh - margen)`) y `.stage` usa `overflow: hidden`; el canvas se achica antes de tapar las columnas. Probar a 720px de ancho además de 1024px. |
| Una paleta con muchos colores podría dejar las herramientas fuera de la vista vertical. | La paleta (no las herramientas) es la que scrollea; las herramientas quedan en su propia columna de altura completa, siempre visibles. |

---

## Qué **no** entra en este spec

- Botón tacho de basura (reiniciar el dibujo).
- Botón cámara (guardar captura en el dispositivo).
- Forzar/sugerir orientación apaisada en la PWA.
- Cambios en el layout de celular (vertical u horizontal).
- Cambios en el motor de colorear o en el flujo de premios/galería.

Cada una, si alguna vez se hace, va en su propio spec.
