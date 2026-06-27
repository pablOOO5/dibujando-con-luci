# SPEC 05 — Cargar en bulk los animales pendientes

> **Estado:** aprobado · **Depende de:** SPEC 04 · **Fecha:** 2026-06-26
> **Objetivo:** Agregar al juego los 20 animales que ya existen como SVG en `public/content/animals/` pero no están en `manifest.json`, validando que cada SVG sirva para el motor (3:2, sin fondo opaco) y creando las categorías `granja` y `mascotas` para los que no entran en las actuales.

---

## Alcance

**Adentro:**

- **Validación de contenido (sin modificar SVGs).** Para cada SVG en `public/content/animals/` que no esté en `manifest.json`, chequear que sirva para el motor: (a) proporción **3:2** (de `viewBox` o de `width/height`), (b) **sin fondo opaco** que tape los rellenos — en particular, sin fills blancos/casi-blancos de área grande (caso `conejo`, `rgb(253,253,253)`) ni `<rect>` de fondo. Los SVG **no se tocan ni se reescriben**.
- **Reporte de los que no validan.** Los SVG que no pasen la validación **no se agregan** al manifest; se listan (con el motivo) para que el usuario los arregle aparte. Mínimo conocido a revisar: `conejo` (fills blancos), `abeja` y `gato` (traza ruidosa multi-fill, a confirmar en la prueba del balde).
- **Dos categorías nuevas** en `manifest.json`: `granja` 🐄 y `mascotas` 🐶, agregadas **después** de las tres existentes.
- **Entradas de animales** en `manifest.json` para todos los SVG válidos, con `id` = filename, `name` = nombre en español con acentos/mayúscula, `categoryId` según el mapeo confirmado, `lineArt` = `/content/animals/<id>.svg`. Sin nuevos `favorite` (solo `koala` sigue siendo favorito).
- **Verificación manual** del flujo en Home y al colorear cada animal agregado (balde por región).

**Fuera de alcance (para futuros specs):**

- **Normalizar/reescribir SVGs** (quitar fills blancos, limpiar traza, pasar a `viewBox 0 0 600 400`): si un SVG no valida, se arregla aparte, no en este spec.
- **La skill automática** que resuelve este caso: este spec solo le sirve de referencia, no se construye acá.
- **Cambios en el motor, layout, galería, premios o recordatorio.**
- **Validación por código en runtime** (la app no chequea SVGs; la validación es del proceso de carga, manual/asistida).
- **Reordenar o renombrar** las categorías existentes o el animal `koala` ya cargado.

---

## Modelo de datos

No se introduce **ningún tipo nuevo**: se reutiliza el schema actual del `manifest.json` (`categories[]` con `id/name/emoji`; `animals[]` con `id/name/categoryId/lineArt/favorite?`). Solo cambian los **datos**.

**Categorías nuevas** (se agregan al final del array `categories`):

```json
{ "id": "granja",   "name": "De la granja", "emoji": "🐄" },
{ "id": "mascotas", "name": "Mascotas",     "emoji": "🐶" }
```

**Animales a agregar** (20 entradas; orden por categoría, sin `favorite`):

| id | name | categoryId |
| --- | --- | --- |
| elefante | Elefante | salvajes |
| jirafa | Jirafa | salvajes |
| leon | León | salvajes |
| mono | Mono | salvajes |
| oso | Oso | salvajes |
| delfin | Delfín | agua |
| pato | Pato | agua |
| pez | Pez | agua |
| pinguino | Pingüino | agua |
| tortuga | Tortuga | agua |
| abeja | Abeja | bichos |
| caracol | Caracol | bichos |
| mariposa | Mariposa | bichos |
| mariquita | Mariquita | bichos |
| caballo | Caballo | granja |
| oveja | Oveja | granja |
| vaca | Vaca | granja |
| conejo | Conejo | mascotas |
| gato | Gato | mascotas |
| perro | Perro | mascotas |

> **Nota:** los que no pasen la validación de la sección Alcance (conocido: `conejo`; a confirmar: `abeja`, `gato`) **no se agregan** aunque figuren en esta tabla; quedan para arreglar aparte. `koala` ya está cargado y no se toca.

`lineArt` de cada uno = `/content/animals/<id>.svg` (con `/` inicial, como el resto).

---

## Plan de implementación

1. **Validar los 20 SVG.** Para cada SVG no presente en el manifest, chequear proporción 3:2 (de `viewBox` o `width/height`) y ausencia de fondo opaco (sin `<rect>` de fondo y sin fills blancos/casi-blancos de área grande). Anotar cuáles pasan y cuáles no, con el motivo.
   _Prueba manual:_ queda una lista clara "válidos / a revisar"; `conejo` cae en "a revisar" por los fills `rgb(253,253,253)`.

2. **Agregar las categorías nuevas al manifest.** Sumar `granja` 🐄 y `mascotas` 🐶 al final de `categories`, sin tocar las tres existentes.
   _Prueba manual:_ Home muestra 5 categorías en orden `Salvajes, Del agua, Bichitos, De la granja, Mascotas`; las nuevas aún sin animales no rompen la grilla.

3. **Agregar las entradas de animales válidos al manifest.** Por cada SVG que pasó el paso 1, sumar su entrada (`id`, `name`, `categoryId`, `lineArt`) según la tabla del Modelo de datos. No agregar los que no validaron.
   _Prueba manual:_ `npm run typecheck` pasa; el `manifest.json` es JSON válido; cada categoría lista sus animales.

4. **Verificar el balde por animal.** Abrir `/colorear/<id>` de cada animal agregado y probar que el balde **rellena por región** y no "se escapa" ni queda bloqueado por un fondo. Los que fallen acá se **sacan** del manifest y pasan a "a revisar".
   _Prueba manual:_ cada animal cargado se colorea bien; los que fallan quedan documentados en el reporte, no en el manifest.

5. **Reporte de pendientes.** Dejar registrada la lista final de SVG no cargados y el motivo (fondo opaco, traza que rompe el balde, etc.), para arreglarlos en otra pasada.
   _Prueba manual:_ existe la lista de pendientes con motivo por cada uno.

6. **Verificación + build.** Recorrer Home → cada categoría → colorear → guardar → galería, y correr `npm run typecheck` y `npm run build`.
   _Prueba manual:_ ambos comandos pasan; el flujo funciona de punta a punta con los animales nuevos.

---

## Criterios de aceptación

- [ ] `manifest.json` tiene **5 categorías** en orden `salvajes, agua, bichos, granja, mascotas`, y sigue siendo JSON válido.
- [ ] Las categorías `granja` (🐄 "De la granja") y `mascotas` (🐶 "Mascotas") existen con ese `id`, `name` y `emoji`.
- [ ] Cada SVG **válido** de `public/content/animals/` tiene su entrada en `animals[]` con `id`=filename, `name` en español con acentos, `categoryId` según la tabla y `lineArt`=`/content/animals/<id>.svg`.
- [ ] Ningún SVG que **no valida** quedó agregado al manifest (mínimo: `conejo` no está si mantiene los fills blancos).
- [ ] Solo `koala` tiene `favorite: true`; ningún animal nuevo es favorito.
- [ ] En Home, cada categoría muestra sus animales y **ninguna categoría queda vacía** (si una quedara sin animales válidos, se documenta el porqué).
- [ ] Al abrir `/colorear/<id>` de cada animal agregado, el **balde rellena por región** sin escaparse ni quedar bloqueado por un fondo.
- [ ] El dibujo **no se deforma** (todos los SVG cargados son 3:2).
- [ ] Existe un **reporte de pendientes** con los SVG no cargados y el motivo de cada uno.
- [ ] Ningún SVG fue modificado/reescrito por este spec.
- [ ] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** **validar sin modificar** los SVG (opción b). El usuario prefiere arreglar el contenido aparte; el spec no debe meterse a reescribir SVGs autotrazados (riesgoso y fuera del foco).
- **No:** **normalizar/limpiar** los SVG automáticamente (opción c). Quitar fills blancos o limpiar traza es trabajo de contenido caso por caso, no de una carga en bulk.
- **No:** **agregar todo al manifest a ciegas** (opción a). Hay SVG que ya se sabe que fallan (`conejo` con fondo blanco); cargarlos rompería el balde y daría una mala primera impresión.
- **Sí:** **crear `granja` y `mascotas`**. Seis animales (caballo, oveja, vaca, conejo, gato, perro) no entran en salvajes/agua/bichos; forzarlos quedaba inconsistente.
- **Sí:** **categorías nuevas al final**, existentes intactas. Mantiene estable lo que ya funciona y el orden conocido de Home.
- **Sí:** **emojis 🐄 / 🐶** para las categorías nuevas (reflejan al grupo, mismo criterio que las actuales: emoji, sin assets).
- **Sí:** **`name` derivado del filename** con acentos correctos en español. El filename ya es el animal; solo se ajusta acento/mayúscula.
- **No:** **nuevos favoritos**. Solo `koala` sigue destacado; no hay pedido de cambiar eso.
- **Sí:** **`abeja`/`gato` se deciden en la prueba del balde**, no se descartan de entrada. Tienen traza ruidosa pero podrían funcionar; se confirma coloreando.
- **Contexto:** la **skill automática** que motivó este pedido **no entra en el spec**; queda como referencia documentada para construirla después.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| SVG con **fondo blanco opaco** (`conejo`, fills `rgb(253,253,253)`) tapa los rellenos y bloquea el balde. | La validación (paso 1) lo detecta y lo deja fuera del manifest; queda en el reporte de pendientes para arreglar aparte. |
| SVG **autotrazados con muchos fills casi-negros** (`abeja`, `gato`) podrían dejar huecos o regiones raras donde el balde se escapa. | Prueba del balde por animal (paso 4); el que falle se saca del manifest y se documenta. |
| Validar "3:2" leyendo mal el tamaño cuando viene como **`width/height` sin `viewBox`** (caso de varios SVG). | La validación contempla ambos: `viewBox` **o** `width`+`height`; todos los medidos dan 1.5 (1536×1024, 2048×1365). |
| Una **categoría queda vacía** si todos sus SVG fallan la validación (ej. si `conejo`, `gato` y `perro` cayeran, `mascotas` quedaría sin animales). | Criterio de aceptación lo cubre: ninguna categoría vacía, o se documenta el motivo; en el peor caso se difiere crear esa categoría hasta tener un animal válido. |
| `name` con acentos mal codificado rompe el JSON o se ve mal en Home. | `manifest.json` es UTF-8; verificación visual en Home (Delfín, Pingüino, León, etc.) en el paso 6. |
