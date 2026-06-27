# SPEC 07 — Lápiz fino, eliminar y cámara en la pantalla de colorear

> **Estado:** implementado · **Depende de:** SPEC 02 (layout lateral) · SPEC 06 (modo libre) · **Fecha:** 2026-06-27
> **Objetivo:** Agregar a la pantalla de colorear una herramienta de lápiz de trazo fino, un botón de eliminar que borra toda la pintura (deshacible) y un botón de cámara que exporta el dibujo como PNG al dispositivo, ubicando los nuevos botones según la app de referencia (columna izquierda en apaisado, barra superior en vertical).

---

## Alcance

**Adentro:**

- **Herramienta lápiz (`pencil`).** Nuevo valor en el type `Tool` de `useColoring.ts` (`'fill' | 'brush' | 'pencil' | 'eraser'`). Pinta igual que el pincel (mismo color de la paleta, mismo `strokeStart/Move/End`, participa del deshacer) pero con grosor fino fijo `PENCIL_SIZE = 8` (vs. `BRUSH_SIZE = 26`). Se agrega como botón `✏️` en las herramientas, entre el pincel y la goma.
- **Botón eliminar (`🗑️`).** Borra toda la capa de pintura: en modo animal deja solo el contorno (canvas blanco debajo); en modo libre deja el lienzo en blanco. **Sin diálogo de confirmación**, pero es **un único paso deshacible** (un toque de ↩️ lo revierte). Reusa el `pushUndo` ya existente. Se agrega como `reset()` en `useColoring.ts`.
- **Botón cámara (`📷`).** Exporta el dibujo compuesto (pintura + contorno, reusando `exportPng`) como PNG **al dispositivo**: usa **Web Share API** con el archivo si está disponible (`navigator.canShare` con `files`), y si no, cae a **descarga directa** vía `<a download>`. Es independiente del botón Guardar de la galería (no toca IndexedDB).
- **Ubicación de los botones (según referencia):**
  - **Apaisado** (layout lateral del SPEC 02): columna izquierda de arriba a abajo `← volver · 🗑️ eliminar · 📷 cámara · ↩️ deshacer`, con `¡Listo! 🎉` al pie. Franja derecha: herramientas `🪣 · 🖌️ · ✏️ · 🧽`.
  - **Vertical** (portrait): barra superior `← volver · 🗑️ eliminar · 📷 cámara · ↩️ deshacer · … · ¡Listo! 🎉`. Lápiz sumado a las herramientas de abajo.
- **Las tres funciones aplican igual en el modo Dibujo libre (`/libre`)**, que reusa esta misma pantalla.
- **Verificación manual** del flujo en ambas orientaciones y en animal + modo libre.

**Fuera de alcance (para futuros specs):**

- **Tamaño de pincel/lápiz variable o configurable** (selector de grosor): los grosores son fijos (`8` y `26`).
- **Más herramientas** (aerógrafo, formas, stamps, cuentagotas) más allá del lápiz.
- **Diálogo de confirmación** para eliminar, o eliminar detrás del parent gate (se eligió deshacible sin diálogo).
- **Guardar la captura de la cámara en la galería interna** (solo exporta al dispositivo).
- **Sonido propio** para eliminar o cámara (no se agregan sonidos nuevos; el trazo del lápiz no suena, igual que el pincel hoy).
- **Cambios en el motor de flood-fill, en premios, recordatorio, ajustes o el `manifest.json`.**
- **Forzar orientación** de la PWA.

---

## Modelo de datos

Esta funcionalidad **no introduce ni modifica estructuras de datos persistidas**: no toca `manifest.json`, ni el schema de `Drawing` de la galería, ni el store de ajustes, ni IndexedDB/localStorage. La cámara exporta al dispositivo (fuera de la app), no persiste nada interno.

Los únicos cambios "de forma" son de tipos/constantes en código, no de datos guardados:

- **Type `Tool`** (en `src/features/coloring/useColoring.ts`) — se suma `'pencil'`:
  ```ts
  // Antes:  export type Tool = 'fill' | 'brush' | 'eraser'
  // Después: export type Tool = 'fill' | 'brush' | 'pencil' | 'eraser'
  ```
- **Constante de grosor** (en `src/pages/Coloring.tsx`, junto a `BRUSH_SIZE`/`ERASER_SIZE`):
  ```ts
  const PENCIL_SIZE = 8
  ```
- **`reset()`** — nueva función expuesta por `useColoring` (no es dato, es API del hook): repinta la capa de pintura en blanco tras un `pushUndo`, dejando el borrado deshacible.

---

## Plan de implementación

1. **Motor: `reset()` en `useColoring.ts`.** Agregar al hook una función `reset()` que, si `ready`, haga `pushUndo()` y luego repinte la capa de pintura en blanco (`fillStyle = '#ffffff'; fillRect(0,0,RES_W,RES_H)`), y la exponga en el `return`. No toca la capa de contorno ni `alphaRef`. Sumar `'pencil'` al type `Tool`.
   _Prueba manual:_ tras pintar y llamar `reset()`, la pintura desaparece (queda el contorno); un toque de deshacer la recupera.

2. **Lápiz en `Coloring.tsx`.** Definir `const PENCIL_SIZE = 8`. En `strokeSize()` devolver `PENCIL_SIZE` cuando `tool === 'pencil'` (color: igual que el pincel, vía `strokeColor()`). Agregar el botón `✏️` en la barra de herramientas, entre `🖌️` pincel y `🧽` goma, con su estado `active`.
   _Prueba manual:_ seleccionar el lápiz y dibujar deja un trazo claramente más fino que el pincel, del color elegido; deshacer funciona.

3. **Botón eliminar (`🗑️`) en `Coloring.tsx`.** Agregar un botón que llame `c.reset()`, deshabilitado si `!c.ready`. Ubicarlo en el header (`tool-top`), después de volver. Sin confirmación.
   _Prueba manual:_ el tacho borra toda la pintura de una; deshacer lo revierte; en modo libre deja el lienzo blanco.

4. **Botón cámara (`📷`) en `Coloring.tsx`.** Agregar un handler `async function capture()` que obtenga el blob de `c.exportPng()` y lo guarde en el dispositivo: si `navigator.canShare?.({ files: [file] })`, usar `navigator.share` con el `File` PNG; si no, crear un `<a>` con `URL.createObjectURL(blob)` y `download` (nombre tipo `luci-<animal.id>.png`), revocando la URL después. Botón en el header, después de eliminar, deshabilitado si `!c.ready`.
   _Prueba manual:_ en escritorio la cámara descarga el PNG; en tablet/celular abre el menú de compartir/guardar; el PNG contiene el dibujo compuesto (pintura + contorno) y se ve completo (3:2).

5. **Layout de los nuevos botones (`src/styles/global.css`).**
   - **Vertical (portrait):** los botones eliminar y cámara entran en `.tool-top` junto a volver/deshacer; el lápiz queda en `.tools`. Verificar que la barra superior no se desborde (los 4 íconos + ¡Listo! entran o se acomodan).
   - **Apaisado (`@media (orientation: landscape)`):** en la columna izquierda (`.tool-top` en `column`), el orden queda `← · 🗑️ · 📷 · ↩️` y `¡Listo!` al pie (sigue con `margin-top:auto`). La franja derecha suma el lápiz a `.tools` sin romper el scroll de la paleta.
   _Prueba manual:_ en viewport vertical (~390×840) y apaisado (~1024×768 y ~800×360) los cinco controles de acción y las cuatro herramientas quedan visibles, con targets grandes, sin solaparse con el canvas ni la paleta.

6. **Verificación + build.** Recorrer el flujo completo en animal y en `/libre`, en vertical y apaisado: pincel/lápiz/goma/balde, eliminar + deshacer, cámara (descarga y compartir), ¡Listo! → festejo → Guardar → galería. Correr `npm run typecheck` y `npm run build`.
   _Prueba manual:_ ambos comandos pasan; todo el flujo funciona en las dos orientaciones y en los dos modos.

---

## Criterios de aceptación

- [x] En las herramientas aparece el lápiz `✏️` entre el pincel `🖌️` y la goma `🧽`, con estado activo al seleccionarlo.
- [x] El trazo del lápiz es **claramente más fino** que el del pincel (8 vs. 26) y usa el color elegido de la paleta.
- [x] El lápiz participa del deshacer igual que el pincel.
- [x] Existe un botón eliminar `🗑️` que borra **toda la pintura** de una, **sin diálogo de confirmación**.
- [x] El borrado del tacho es **un único paso deshacible**: un toque de `↩️` recupera el dibujo anterior.
- [x] En modo animal, eliminar deja **solo el contorno**; en modo libre, deja el **lienzo en blanco**.
- [x] Existe un botón cámara `📷` que exporta el dibujo (pintura + contorno) como PNG **al dispositivo**.
- [x] En dispositivos con Web Share API, la cámara abre el menú de compartir/guardar del sistema; en el resto, **descarga** el PNG.
- [x] La cámara **no** crea una entrada en la galería interna (IndexedDB); el flujo Guardar de la galería sigue igual.
- [x] El PNG exportado se ve **completo y sin deformar** (3:2), con el contorno sobre la pintura.
- [x] **Apaisado:** la columna izquierda muestra de arriba a abajo `← · 🗑️ · 📷 · ↩️` y `¡Listo! 🎉` al pie; las herramientas `🪣 · 🖌️ · ✏️ · 🧽` quedan en la franja derecha.
- [x] **Vertical:** la barra superior incluye volver, eliminar, cámara y deshacer (más `¡Listo!`), y el lápiz aparece en las herramientas de abajo.
- [x] En vertical (~390×840), apaisado tablet (~1024×768) y apaisado celular (~800×360), todos los botones quedan visibles, con targets grandes, sin solaparse con el canvas ni la paleta.
- [x] Las tres funciones (lápiz, eliminar, cámara) funcionan igual en `/colorear/:id` y en `/libre`.
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** lápiz como **grosor fijo `8`**, no un selector de tamaño variable. Un control de grosor agrega complejidad y decisiones (¿cuántos tamaños?, ¿UI?) que no aportan a Luci; dos opciones claras (pincel grueso / lápiz fino) son más predecibles. El selector variable queda fuera de alcance.
- **Sí:** el lápiz **reusa `strokeStart/Move/End`** con otro `size`, sin lógica nueva en el motor. Mínimo cambio, mismo comportamiento probado del pincel.
- **Sí:** eliminar **sin diálogo de confirmación pero deshacible**. Un diálogo extra rompe la simpleza/predecibilidad (criterio del proyecto); el deshacer ya existente cubre el borrado accidental como un paso más. Se descartaron: confirmación modal y tacho detrás del parent gate.
- **Sí:** `reset()` **repinta en blanco** la capa de pintura y **no toca el contorno ni `alphaRef`**. Así sirve igual para animal (queda el line-art) y para libre (queda el lienzo blanco) sin casos especiales.
- **Sí:** cámara con **Web Share API y fallback a descarga**. Share da la mejor experiencia "guardar en fotos" en tablets/celulares (el dispositivo principal de Luci); la descarga garantiza que funcione en escritorio y navegadores sin Share.
- **Sí:** la cámara **reusa `exportPng`** (pintura + contorno) y captura **solo el dibujo**, no la UI. Es lo que tiene valor para guardar/compartir y evita complejidad de capturar el DOM.
- **No:** que la cámara **además** guarde en la galería interna. Son dos intenciones distintas (sacar la foto al dispositivo vs. guardar para seguir en la app); mezclarlas confunde. El botón Guardar de la galería se mantiene.
- **Sí:** ubicar los botones **según la referencia** (columna izquierda en apaisado, barra superior en vertical), continuando el layout del SPEC 02, que ya había dejado estos dos botones como pendientes.
- **No:** agregar **sonidos nuevos** para eliminar/cámara ni hacer sonar el lápiz. Mantiene el set sensorial actual; cualquier sonido nuevo iría condicionado al ajuste `sound` en otro spec.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| **Web Share API con archivos** no está soportada o falla en algún navegador (varía en iOS/Android/escritorio). | El handler chequea `navigator.canShare?.({ files })` antes de usar Share; si no, cae a descarga `<a download>`. Siempre hay un camino para guardar. |
| En iOS, una **descarga** de PNG puede abrir el archivo en una pestaña en vez de guardarlo en Fotos. | En esos dispositivos suele estar disponible Share (camino preferido); la descarga es el fallback de último recurso, documentado como tal. |
| El **deshacer está acotado a 6 snapshots**: si Luci hace varias acciones después de eliminar, el reset puede salir de la ventana y dejar de ser recuperable. | Es el comportamiento ya existente del undo; el criterio "un toque de ↩️ revierte" se cumple **inmediatamente** tras eliminar. No se promete recuperación ilimitada. |
| Sumar eliminar + cámara a la **barra superior en vertical** podría desbordar o apretar los íconos en celulares angostos. | El paso 5 verifica explícitamente a ~390×840; si aprieta, se ajusta tamaño/espaciado en CSS sin achicar los targets por debajo de lo táctil. |
| El usuario podría tocar la **cámara con el dibujo vacío** (canvas blanco) y exportar un PNG en blanco. | El botón se deshabilita con `!c.ready`; exportar un dibujo apenas empezado es válido (no es un error), así que no se bloquea por contenido. |
| `URL.createObjectURL` sin revocar genera **fuga de memoria** en el fallback de descarga. | El handler hace `URL.revokeObjectURL` tras disparar la descarga. |
