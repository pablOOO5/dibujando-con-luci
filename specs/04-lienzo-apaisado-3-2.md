# SPEC 04 — Lienzo apaisado 3:2 (dibujos no cuadrados)

> **Estado:** Aprobado · **Depende de:** SPEC 02, SPEC 03 · **Fecha:** 2026-06-26
> **Objetivo:** Pasar el lienzo de colorear de cuadrado a apaisado 3:2 (900×600 interno), soportando SVG line-art 3:2 con fondo transparente, y ajustar en consecuencia el motor, el layout, la galería y la guía de medidas.

---

## Alcance

**Adentro:**

- **Motor a 3:2.** En `src/features/coloring/useColoring.ts`, reemplazar `RES = 900` cuadrado por dos dimensiones (`RES_W = 900`, `RES_H = 600`). Ajustar todo lo que hoy usa `RES` para ambos ejes: tamaño de los canvas, `fillRect`, `drawImage`, `getImageData`, la máscara de alpha, `toCanvas` (mapear `x` por ancho y `y` por alto) y `exportPng`.
- **Layout 3:2.** En `src/styles/global.css`, pasar `.canvas-wrap` de `aspect-ratio: 1` a `aspect-ratio: 3 / 2`, y revisar el dimensionado en apaisado (SPEC 03) y en vertical para que el lienzo apaisado entre completo y centrado.
- **Galería sin recorte.** Ajustar `.gallery-item img` (hoy `aspect-ratio: 1`) para que la miniatura muestre el dibujo apaisado **completo**, sin recortar.
- **Contenido 3:2.** Eliminar los 6 SVG cuadrados actuales (`koala`, `elefante`, `pato`, `pez`, `tortuga`, `mariposa`) y sus entradas del `manifest.json`. Integrar el **primer SVG 3:2** que suba el usuario, para validar.
- **Guía de medidas.** Reescribir `docs/medidas-de-los-dibujos.md` para 3:2 (`viewBox="0 0 600 400"`, fondo transparente, líneas negras, regiones cerradas) e incluir un **prompt de generación más específico** (3:2, estilo consistente).
- **CLAUDE.md.** Actualizar "Cómo agregar un animal" (hoy dice `viewBox="0 0 400 400"`) a 3:2.

**Fuera de alcance (para futuros specs):**

- **Cargar en bulk** el resto de los dibujos: es contenido (SVG + entradas de manifest), sin código; se hace después de validar el primero.
- **Opción A** (que el motor consuma PNG raster con fondo blanco por luminancia): se descartó; el tratamiento a SVG transparente lo hace el usuario.
- **Soportar relaciones de aspecto mixtas / por dibujo**: todo es 3:2 fijo.
- Botón tacho, botón cámara, forzar orientación (ya diferidos).
- Cambios en premios, recordatorio o el flujo de guardado.

---

## Modelo de datos

Esta funcionalidad **no introduce nuevas estructuras de datos** (no toca store, persistencia ni el schema del `manifest`). El único cambio "de datos" es la **constante de resolución interna** del motor, que pasa de un valor cuadrado a dos:

```ts
// src/features/coloring/useColoring.ts
// Antes:
const RES = 900            // cuadrado

// Después:
const RES_W = 900          // ancho interno
const RES_H = 600          // alto interno (3:2)
```

Convenciones que se mantienen:

- `floodFill` ya trabaja con `width`/`height` genéricos del `ImageData`: **no cambia**.
- El `manifest.json` conserva su forma (`id`, `name`, `categoryId`, `lineArt`, `favorite`): solo cambian las **entradas** (se borran las viejas, se agrega la nueva), no el schema.
- Los SVG pasan a `viewBox="0 0 600 400"` con fondo transparente (regla de contenido, no de código).

---

## Plan de implementación

1. **Motor a 3:2 (`useColoring.ts`).** Reemplazar `RES = 900` por `RES_W = 900` y `RES_H = 600`. Actualizar cada uso: `paint/outline.width = RES_W`, `.height = RES_H`; `fillRect(0,0,RES_W,RES_H)`; `drawImage(img,0,0,RES_W,RES_H)`; `getImageData(0,0,RES_W,RES_H)`; `alpha = new Uint8ClampedArray(RES_W*RES_H)`; en `toCanvas` mapear `x` por `RES_W` y `y` por `RES_H`; `exportPng` con `RES_W×RES_H`. Devolver `RES_W`/`RES_H` en el hook.
   _Prueba manual:_ `npm run typecheck` pasa; con un SVG cuadrado viejo el dibujo se ve estirado (esperado hasta el paso 4), pero el balde y el pincel siguen pintando.

2. **Lienzo apaisado en CSS (`global.css`).** En `.canvas-wrap`, `aspect-ratio: 1` → `aspect-ratio: 3 / 2`. Revisar el dimensionado en apaisado (regla del SPEC 03) y en vertical para que el lienzo 3:2 entre completo, cuadrado a la proporción y centrado, sin tapar columnas.
   _Prueba manual:_ a 1024×768 y 1280×720 el lienzo se ve apaisado y centrado; en portrait entra completo.

3. **Galería sin recorte (`global.css`).** En `.gallery-item img`, pasar de `aspect-ratio: 1` (que recorta) a mostrar el dibujo apaisado completo (`aspect-ratio: 3 / 2` y/o `object-fit: contain`).
   _Prueba manual:_ una entrada guardada apaisada se ve completa en la grilla, sin recorte.

4. **Contenido 3:2.** Agregar el primer SVG 3:2 que suba el usuario a `public/content/animals/` y su entrada en `manifest.json`; eliminar los 6 SVG cuadrados y sus entradas. (Requiere que el usuario pase el primer SVG.)
   _Prueba manual:_ Home muestra el animal nuevo; al colorearlo, el lienzo apaisado no deforma el dibujo y el balde rellena por región.

5. **Reescribir la guía (`docs/medidas-de-los-dibujos.md`).** Actualizar a 3:2 (`viewBox="0 0 600 400"`, fondo transparente, líneas negras, regiones cerradas, flujo IA→vectorizar→quitar fondo) e incluir el prompt de generación más específico.
   _Prueba manual:_ el archivo abre en GitHub y el prompt se puede copiar.

6. **Actualizar CLAUDE.md.** Cambiar la referencia de `viewBox="0 0 400 400"` a 3:2 en "Cómo agregar un animal" (el link a la guía ya existe del SPEC 03).
   _Prueba manual:_ el texto refleja 3:2 y el link sigue resolviendo.

7. **Verificación + build.** Probar el flujo completo (colorear → guardar → galería) y correr `npm run typecheck` y `npm run build`.
   _Prueba manual:_ ambos comandos pasan; el flujo funciona de punta a punta.

---

## Criterios de aceptación

- [ ] En `useColoring.ts` no queda ningún uso de un `RES` cuadrado: el canvas interno es **900×600**.
- [ ] Al colorear un SVG 3:2, el dibujo **no se deforma** (se ve apaisado, no estirado).
- [ ] El **balde rellena por región** y el **pincel/goma** pintan bajo las líneas en el lienzo apaisado.
- [ ] El **toque cae en el lugar correcto**: pintar arriba-izquierda del dibujo pinta arriba-izquierda (mapeo de coordenadas correcto en X e Y).
- [ ] En apaisado (1024×768 y 1280×720) el lienzo 3:2 se ve **completo, centrado y sin tapar las columnas**.
- [ ] En vertical (portrait) el lienzo 3:2 entra **completo y centrado**.
- [ ] Al guardar, la **miniatura en la galería muestra el dibujo apaisado completo**, sin recorte.
- [ ] El **PNG exportado** mantiene la proporción 3:2.
- [ ] No quedan los 6 SVG cuadrados viejos ni sus entradas en `manifest.json`; está el primer SVG 3:2 y aparece en Home.
- [ ] `docs/medidas-de-los-dibujos.md` describe 3:2 (`viewBox="0 0 600 400"`, fondo transparente, regiones cerradas) e incluye el prompt específico.
- [ ] CLAUDE.md refleja 3:2 en "Cómo agregar un animal".
- [ ] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** relación **3:2 fija para todos** los dibujos. El usuario va a regenerar todo el contenido con IA, así que no hace falta soportar proporciones mixtas; lo fijo es más simple y robusto.
- **No:** relación de aspecto **por dibujo** (leer el tamaño de cada SVG). Era más flexible pero innecesario si todo el contenido es 3:2; agregaba complejidad al motor sin beneficio.
- **Sí:** mantener la arquitectura de **SVG con fondo transparente** y paredes por **canal alpha** (Opción B). El motor casi no cambia.
- **No:** **Opción A** (motor consume PNG raster con fondo blanco vía luminancia + quitar blanco). Más código en el motor; el usuario prefiere dar el tratamiento (vectorizar a SVG) él mismo.
- **Sí:** resolución interna **900×600** (lado largo 900). Mantiene acotado el costo del flood-fill en hardware modesto (menos píxeles que el 900×900 anterior).
- **Sí:** **eliminar** los 6 dibujos cuadrados actuales. A 3:2 se verían deformados; se reemplazan por contenido nuevo.
- **Sí:** **validar con el primer dibujo** y recién después cargar el resto en bulk. Baja el riesgo: si el formato falla, se detecta con uno solo.
- **Sí:** arreglar las **miniaturas de la galería** en este mismo spec. Sin eso se verían recortadas desde el día uno.
- **Sí:** reescribir la **guía** y el **prompt** para 3:2. El prompt más específico ayuda a que todos los dibujos salgan consistentes (mismo trazo, regiones cerradas, apaisado).

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El SVG vectorizado conserva un **rectángulo blanco de fondo** → tapa los rellenos y bloquea el balde. | La guía marca "quitar el fondo" como paso obligatorio. Validamos con el primer dibujo antes del bulk; si falla, se ve enseguida. |
| El line-art vectorizado tiene **huecos en las líneas** → el balde "se escapa" a regiones vecinas. | El prompt pide "no gaps in lines"; el criterio de aceptación incluye probar el balde por región en el primer dibujo. |
| El mapeo de coordenadas queda mal al separar X/Y (`RES_W`/`RES_H`) → el toque pinta corrido. | Criterio de aceptación explícito: pintar arriba-izquierda pinta arriba-izquierda. Probar en apaisado y vertical. |
| Borrar los 6 SVG viejos deja la app **sin animales** si el primer SVG nuevo no está listo. | El paso 4 agrega el primero **en el mismo paso** que borra los viejos; siempre queda ≥1 animal. |
| Líneas muy finas al rasterizar a 900×600 quedan con alpha < 110 y **no frenan** el balde. | La guía pide trazo grueso; si pasa, se ajusta el grosor del SVG (no el umbral del motor). |

---

## Qué **no** entra en este spec

- Cargar en bulk el resto de los dibujos (contenido, sin código).
- Opción A (motor consume PNG raster con fondo blanco).
- Relaciones de aspecto mixtas o por dibujo.
- Botón tacho, botón cámara, forzar orientación.
- Cambios en premios, recordatorio o el flujo de guardado.

Cada una, si alguna vez se hace, va en su propio spec.
