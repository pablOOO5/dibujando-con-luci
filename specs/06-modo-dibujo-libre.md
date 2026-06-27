# SPEC 06 — Modo "Dibujo libre" (lienzo en blanco)

> **Estado:** Implementado · **Depende de:** SPEC 04 (lienzo 3:2) · **Fecha:** 2026-06-27
> **Objetivo:** Agregar un modo "Dibujo libre" que abre un lienzo apaisado 3:2 en blanco (sin contorno) con pincel, goma y balde, accesible desde una tarjeta fija primera en la grilla del Home y guardable en la galería igual que un animal.

---

## Alcance

**Adentro:**

- **Motor con lienzo en blanco.** En `useColoring.ts`, soportar un modo `blank`: inicializa el canvas de pintura en blanco, arma una máscara de bordes (`alphaRef`) toda en cero (sin paredes) y marca `ready = true` sin cargar SVG. El balde (flood-fill) rellena la región contigua del mismo color: en lienzo vacío pinta todo (fondo); si Luci cerró un trazo, rellena adentro.
- **Ruta `/libre`** en `app.tsx`, que renderiza la pantalla de colorear en modo libre (sin animal real).
- **Reuso de la pantalla de colorear.** `Coloring.tsx` acepta un modo libre: usa un "animal" sintético (`id: 'libre'`, `name: 'Dibujo libre'`, sin `lineArt`) para reusar toolbar (pincel/goma/balde), paleta, `¡Listo!` → festejo → Guardar, y la capa de contorno (vacía).
- **Entrada en Home.** Una tarjeta fija "✏️ Dibujo libre", siempre primera en la grilla de cada categoría (mismo lugar siempre = predecible para Luci), que navega a `/libre`.
- **Guardado en galería.** Reusa `saveDrawing` con `animalId: 'libre'`, `animalName: 'Dibujo libre'`. Aparece en la galería como cualquier dibujo (cada guardado con su id único).
- **Verificación manual** del flujo: Home → tarjeta libre → pintar (pincel/goma/balde) → deshacer → ¡Listo! → festejo → Guardar → aparece en galería.

**Fuera de alcance (para futuros specs):**

- Cambiar tamaño/proporción del lienzo (sigue siendo 3:2 / 900×600, se reusa todo).
- Herramientas nuevas (formas, stamps, tamaños de pincel variables, más colores): se usa la paleta y herramientas actuales tal cual.
- Fondo inicial de color o elegir tamaño/orientación antes de empezar.
- Cargar fotos/imágenes propias como base para dibujar encima.
- Cambios en premios, recordatorio, ajustes o el schema del `manifest.json` (la tarjeta libre no vive en el manifest; es de la UI).

---

## Modelo de datos

No se introduce ningún tipo nuevo ni se toca el `manifest.json`. El modo libre no es contenido data-driven: la tarjeta es de UI y el "animal" es sintético en memoria.

- **Animal sintético** (solo en `Coloring.tsx`, no se persiste ni va al manifest):
  ```ts
  const LIBRE: Animal = { id: 'libre', name: 'Dibujo libre', lineArt: '' }
  ```
- **Motor (`useColoring`)** — nueva opción para el lienzo en blanco (sin cambiar la resolución 900×600):
  ```ts
  // Antes:  useColoring(lineArt: string)
  // Después: useColoring(lineArt: string, blank = false)
  // blank=true → canvas blanco, alphaRef = new Uint8ClampedArray(RES_W*RES_H) (todo 0), ready=true, sin cargar SVG
  ```
- **Galería** — se reusa el schema actual de `Drawing` sin cambios; los dibujos libres se guardan con `animalId: 'libre'`, `animalName: 'Dibujo libre'` (el id de registro sigue siendo `libre-<createdAt>`, único).

---

## Plan de implementación

1. **Motor: modo `blank` (`src/features/coloring/useColoring.ts`).** Agregar parámetro `blank = false`. En el `useEffect`, si `blank`: pintar el canvas blanco (ya lo hace), setear `alphaRef.current = new Uint8ClampedArray(RES_W * RES_H)` (todo 0), `setReady(true)` y retornar sin cargar imagen. Mantener la guarda actual `if (!lineArt) return` solo para el caso no-libre.
   _Prueba manual:_ con `blank` el canvas aparece blanco y `ready` es true; pincel, goma y balde funcionan; deshacer funciona.

2. **Pantalla en modo libre (`src/pages/Coloring.tsx`).** Aceptar prop `free?: boolean`. Si `free`: usar el animal sintético `LIBRE`, llamar `useColoring('', true)`, saltear el `findAnimal`/`notFound`. El resto (toolbar, paleta, ¡Listo!, festejo, guardar, exportPng) se reusa igual. El título muestra "Dibujo libre".
   _Prueba manual:_ `/libre` abre el lienzo blanco con toolbar y paleta; `¡Listo!` dispara el festejo; Guardar persiste.

3. **Ruta `/libre` (`src/app.tsx`).** Agregar `<Route path={path('/libre')} component={() => <Coloring free />} />`.
   _Prueba manual:_ navegar a `/libre` (y desde la tarjeta) carga la pantalla libre; las otras rutas siguen igual.

4. **Tarjeta fija en Home (`src/pages/Home.tsx`).** Antes del `.map` de `animals`, renderizar una `animal-card` fija "✏️ Dibujo libre" que hace `route('/libre')`, primera en la grilla de cada categoría. Usar un emoji/recuadro en vez de `<img>` (no hay SVG).
   _Prueba manual:_ en toda categoría la tarjeta aparece primera y abre el modo libre; las tarjetas de animales no se rompen.

5. **Verificación + build.** Flujo completo (Home → libre → pincel/goma/balde → deshacer → ¡Listo! → festejo → Guardar → galería) y correr `npm run typecheck` y `npm run build`.
   _Prueba manual:_ ambos comandos pasan; el dibujo libre guardado se ve completo (3:2) en la galería.

---

## Criterios de aceptación

- [x] Existe la ruta `/libre` y abre un lienzo apaisado 3:2 en blanco (sin contorno).
- [x] En Home, una tarjeta "✏️ Dibujo libre" aparece primera en la grilla de cada categoría y navega a `/libre`.
- [x] En modo libre, pincel y goma pintan/borran sobre el lienzo blanco.
- [x] El balde rellena la región contigua del mismo color: en lienzo vacío pinta todo el fondo; dentro de un trazo cerrado, rellena solo adentro.
- [x] Deshacer funciona (acotado a 6 snapshots, como en animales).
- [x] `¡Listo!` dispara el festejo y permite Guardar; el dibujo aparece en la galería como "Dibujo libre", completo y sin recorte (3:2).
- [x] Se pueden guardar varios dibujos libres sin pisarse entre sí.
- [x] El `manifest.json` no se modifica; no hay un animal "libre" en el contenido.
- [x] Las rutas y pantallas existentes (animales, galería, ajustes) siguen funcionando igual.
- [x] `npm run typecheck` y `npm run build` pasan sin errores.

---

## Decisiones

- **Sí:** tarjeta fija primera en cada categoría. Mismo lugar siempre = predecible para Luci (criterio sensorial/autismo del proyecto). Se descartó un botón en la barra superior (menos visible para ella) y una categoría propia (un click extra).
- **Sí:** reusar la pantalla de colorear con un flag `free` y un animal sintético, en vez de una pantalla nueva. Reusa toolbar, paleta, festejo, guardado y export sin duplicar código.
- **Sí:** balde habilitado con flood-fill sobre máscara en cero. Da "pintar fondo" gratis y, como bonus, rellena dentro de trazos cerrados, sin lógica extra.
- **Sí:** el modo libre NO vive en el `manifest.json`. No es contenido (no hay SVG); meterlo al manifest ensuciaría el modelo data-driven y obligaría a un caso especial en el loader.
- **Sí:** guardar con `animalId: 'libre'` reusando `saveDrawing` tal cual; el id de registro ya es único por timestamp.
- **No:** fondo de color inicial, tamaños de pincel o herramientas nuevas. Se mantiene el set actual para no agrandar el alcance; cada una iría en su propio spec.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con la máscara en cero, el balde sobre un trazo no perfectamente cerrado "se escapa" y pinta de más. | Es comportamiento esperado del flood-fill sin paredes; deshacer lo revierte. No se promete "rellenar formas abiertas". |
| La guarda actual `if (!lineArt) return` bloquearía el modo libre (lineArt vacío). | El paso 1 separa el caso `blank` antes de esa guarda, así el lienzo vacío sí inicializa. |
| La tarjeta fija primera desordena o rompe la grilla en alguna categoría. | Reusa la clase `animal-card`; criterio de aceptación verifica que las tarjetas de animales no se rompan. |
| `exportPng` compone contorno vacío → PNG con transparencia inesperada. | El canvas de pintura ya arranca blanco; el contorno vacío es transparente y no afecta. Se verifica la miniatura en galería. |
