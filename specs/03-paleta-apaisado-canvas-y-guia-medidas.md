# SPEC 03 — Paleta redonda en apaisado, canvas más grande y guía de medidas

> **Estado:** aprobado · **Depende de:** SPEC 02 · **Fecha:** 2026-06-26
> **Objetivo:** En apaisado, que los colores se vean redondos y scrolleen con las herramientas en el borde exterior, que el dibujo use todo el alto disponible, y documentar en `/docs` las medidas correctas de los dibujos (1:1, `viewBox 0 0 400 400`) con una referencia desde CLAUDE.md.

---

## Alcance

**Adentro:**

- **Paleta redonda + scroll en apaisado.** En `@media (orientation: landscape)`, agregar `flex-shrink: 0` a los `.swatch` para que mantengan 46×46 px (círculos) y la paleta scrollee de verdad cuando no entran todos.
- **Orden colores/herramientas (verificación).** Dejar como criterio de aceptación que en apaisado los **colores queden pegados al canvas** y las **herramientas en el borde exterior** (ya lo logra `row-reverse`; no es cambio nuevo).
- **Canvas más grande en apaisado.** Redimensionar `.canvas-wrap` para que use **todo el alto disponible** del `.stage` (manteniéndolo cuadrado 1:1), en vez del tamaño actual atado a `100dvh - 24px`.
- **Guía de medidas en `/docs`.** Nuevo archivo `docs/medidas-de-los-dibujos.md` que explique: formato cuadrado 1:1, `viewBox="0 0 400 400"`, que el line-art llegue cerca de los bordes (margen ~10–20 px por el `stroke`), que un SVG no cuadrado **se deforma** (el motor lo estira a 900×900), e incluya el **prompt de referencia** para generar el line-art con un modelo de imagen.
- **Referencia desde CLAUDE.md.** Un link a esa guía en la sección "Cómo agregar un animal".
- Cambios acotados a: `src/styles/global.css`, nuevo `docs/medidas-de-los-dibujos.md`, y CLAUDE.md.

**Fuera de alcance (para futuros specs):**

- Validar o avisar automáticamente si un SVG no es cuadrado — **solo guía**, sin código de chequeo.
- Botón tacho (reiniciar) y botón cámara (captura), ya diferidos en SPEC 02.
- Forzar/sugerir orientación apaisada en la PWA.
- El layout en **vertical** (portrait): no se toca.
- Cualquier cambio en el motor de colorear (`useColoring`, `floodFill`) o en premios/galería.

---

## Modelo de datos

Esta funcionalidad **no introduce ni modifica estructuras de datos**. Son cambios de CSS (`src/styles/global.css`) más documentación nueva (`docs/medidas-de-los-dibujos.md` y una referencia en CLAUDE.md). No toca estado, store, persistencia, el manifest ni el motor de colorear. Reutiliza todo lo existente (`useColoring`, `PALETTE`, layout del SPEC 02).

---

## Plan de implementación

1. **Swatches redondos + scroll real (apaisado).** En `src/styles/global.css`, dentro de `@media (orientation: landscape)`, agregar `.tool-bottom .swatch { flex-shrink: 0 }`. Efecto: los círculos mantienen 46×46 px y, al no caber todos, la paleta (que ya tiene `overflow-y: auto; max-height: 100%`) scrollea en vez de aplastarlos.
   _Prueba manual:_ viewport 1024×768 en `/colorear/koala` → los colores se ven redondos y la columna scrollea con la rueda/toque.

2. **Canvas usa todo el alto disponible (apaisado).** En el mismo bloque, cambiar la regla de `.canvas-wrap` de `width: min(94vw, calc(100dvh - 24px))` a un dimensionado por alto: `height: 100%; width: auto; max-width: 94vw` (manteniendo `aspect-ratio: 1`). Efecto: el cuadrado crece hasta el alto del `.stage`, con `max-width` como tope para que nunca tape las columnas.
   _Prueba manual:_ el dibujo se ve más grande, cuadrado y centrado, sin montarse sobre las columnas (probar a 1024×768 y a 1280×720).

3. **Crear la guía de medidas.** Nuevo archivo `docs/medidas-de-los-dibujos.md` con: formato cuadrado 1:1, `viewBox="0 0 400 400"`, line-art cerca de los bordes (margen ~10–20 px por el `stroke` ~7), advertencia de que un SVG no cuadrado se deforma (el motor lo estira a 900×900), y el **prompt de referencia** para generar el line-art con un modelo de imagen.
   _Prueba manual:_ el archivo abre en GitHub y el prompt se puede copiar.

4. **Referenciar la guía en CLAUDE.md.** En la sección "Cómo agregar un animal", agregar un link a `docs/medidas-de-los-dibujos.md`.
   _Prueba manual:_ el link resuelve al archivo creado en el paso 3.

5. **Verificación cruzada del portrait + build.** Confirmar que en vertical (celu y tablet portrait) el layout no cambió, y correr `npm run typecheck` y `npm run build`.
   _Prueba manual:_ portrait sigue con barra-arriba / canvas / barra-abajo; ambos comandos pasan sin errores.

---

## Criterios de aceptación

- [ ] En apaisado (`/colorear/koala`, viewport 1024×768) los colores se ven **redondos** (46×46 px), no ovalados.
- [ ] Cuando los colores no entran a lo alto, la **paleta scrollea verticalmente** y los swatches **no se achican**.
- [ ] Los **colores quedan pegados al canvas** y las **herramientas (balde/pincel/goma) en el borde exterior**.
- [ ] El **canvas se ve cuadrado, centrado y usa todo el alto disponible** del área central, sin montarse sobre las columnas (probado a 1024×768 y 1280×720).
- [ ] Existe `docs/medidas-de-los-dibujos.md` con: formato 1:1, `viewBox="0 0 400 400"`, recomendación de margen ~10–20 px, advertencia de deformación si no es cuadrado, y el prompt de referencia para generar line-art.
- [ ] CLAUDE.md tiene, en "Cómo agregar un animal", un link a `docs/medidas-de-los-dibujos.md`.
- [ ] En vertical (celu o tablet portrait) el layout **no cambia** (barra arriba + canvas + barra abajo).
- [ ] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** `flex-shrink: 0` en los `.swatch` en apaisado. Es la causa raíz de los óvalos: sin eso, flexbox los comprime antes de scrollear. Mantiene los targets grandes (clave para Luci).
- **No:** achicar los swatches para que entren todos sin scroll. Rompe la accesibilidad (targets grandes); el scroll es la solución correcta y ya estaba previsto en el SPEC 02.
- **Sí:** dimensionar el canvas por alto (`height: 100%; width: auto; max-width: 94vw`). Aprovecha la pantalla apaisada; los dibujos son 1:1, así que crecer por alto los muestra lo más grande posible.
- **No:** dejar `width: min(94vw, calc(100dvh - 24px))`. Dejaba aire vertical y el dibujo más chico de lo necesario.
- **Sí:** tratar el orden colores/herramientas como criterio de aceptación, no como cambio nuevo. El `row-reverse` del SPEC 02 ya lo logra; la captura era de un deploy viejo (`main`, sin mergear el branch).
- **Sí:** documentar las medidas en `/docs` + referencia en CLAUDE.md, en vez de validar por código. Hoy todos los SVG ya son 400×400; una guía es barata y suficiente.
- **No:** agregar un chequeo automático de imágenes no cuadradas. Es código nuevo sin necesidad actual; queda para otro spec si alguna vez molesta.
- **Sí:** incluir un prompt de generación de imagen en la guía. Acelera crear nuevos line-art consistentes (trazo grueso, sin sombras, áreas grandes para colorear).

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con `height: 100%; width: auto`, en tablets angostas el canvas cuadrado podría quedar más ancho que el espacio entre columnas y solaparse. | `max-width: 94vw` lo acota, y `.stage` tiene `overflow: hidden`; el canvas se achica antes de tapar las columnas. Probar a 1024×768 y 1280×720. |
| Alguien sube un SVG no cuadrado y se deforma sin darse cuenta. | La guía en `/docs` lo advierte explícitamente; CLAUDE.md la referencia en "Cómo agregar un animal". (Validar por código quedó fuera de alcance a propósito.) |

---

## Qué **no** entra en este spec

- Validación automática de imágenes no cuadradas (solo guía).
- Botón tacho (reiniciar) y botón cámara (captura).
- Forzar/sugerir orientación apaisada en la PWA.
- Cambios en el layout en vertical (portrait).
- Cambios en el motor de colorear o en el flujo de premios/galería.

Cada una, si alguna vez se hace, va en su propio spec.
