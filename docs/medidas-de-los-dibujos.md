# Medidas y formato correcto de los dibujos

Guía para que un dibujo nuevo (line-art para colorear) entre bien en el lienzo
**apaisado** y funcione con el balde y las capas del motor.

## Formato correcto (resumen)

El SVG final tiene que cumplir **las cuatro reglas**:

1. **Proporción 3:2 (apaisado)** → `viewBox="0 0 600 400"`. El lienzo de la app es 3:2;
   un SVG con otra proporción **se deforma** (el motor lo lleva a 900×600).
2. **Fondo transparente** ← el paso clave del "tratamiento". Sin fondo (ningún
   rectángulo blanco). Si queda blanco, el motor se rompe: la capa de contorno
   (que va arriba) **tapa los rellenos** y, como el alpha queda 255 en todos lados,
   **bloquea el balde** (todo se lee como "pared").
3. **Líneas negras** como trazo (`stroke`) o relleno (`fill="#1a1a1a"` / `#000000`),
   pero **el fondo no**.
4. **Regiones cerradas** (sin huecos en las líneas) para que el balde no "se escape"
   de una región a la vecina.

## Por qué 3:2 y por qué transparente

- El área de dibujo es **apaisada 3:2** y el motor rasteriza el SVG a un canvas
  interno de **900×600 px**. Si el archivo no es 3:2, se estira.
- El motor detecta las "paredes" donde frena el balde por el **canal alpha** del
  contorno: solo los trazos tienen alpha, el resto es transparente. Por eso el
  fondo **tiene que** ser transparente.

## Flujo recomendado (IA → SVG)

1. **Generar** la imagen con un modelo de IA usando el prompt de abajo (sale un
   **PNG con fondo blanco**).
2. **Vectorizar** el PNG a SVG (cualquier herramienta de vectorización / "trace").
3. **Quitar el fondo blanco** → que el fondo quede transparente. Muchas
   herramientas dejan un rectángulo blanco; hay que borrarlo.
4. **Ajustar el `viewBox` a 3:2** (`0 0 600 400`) si no quedó así.
5. Guardar como `public/content/animals/<id>.svg`.

> Si el trazo quedó muy fino y el balde "se escapa", **engrosá las líneas** del SVG
> (no se toca el motor).

## Prompt de referencia para generar el line-art

Reemplazá `[ANIMAL]` por el animal (en inglés) y `[POSE]` por una acción simple
(p.ej. `sitting`, `clinging to a branch`, `standing`). El prompt apunta a que
**todos los dibujos salgan consistentes** (mismo trazo, apaisado, regiones cerradas):

```
Flat black-and-white line art of a cute friendly [ANIMAL] [POSE], coloring book
page style, in a horizontal 3:2 landscape composition. Single subject, centered
and filling the frame. Thick, uniform, continuous solid black outlines of even
weight. Closed shapes with no gaps in the lines. Zero shading, zero grayscale,
no fills — outlines only. Pure white background. High contrast. Geometric
simplicity, clean lines, large open areas for coloring.
```

## Cómo se suma al proyecto (y cómo se categoriza)

La **categoría no va dentro del SVG**: se define en `public/content/manifest.json`
con el campo `categoryId` de cada animal. Por cada dibujo:

1. Dejar el SVG en `public/content/animals/<id>.svg` (3:2, fondo transparente).
2. Agregar una entrada en `animals` del manifest:

```json
{ "id": "cocodrilo", "name": "Cocodrilo", "categoryId": "salvajes", "lineArt": "/content/animals/cocodrilo.svg" }
```

- **`id`**: nombre del archivo sin `.svg`, minúscula, sin espacios ni acentos.
- **`lineArt`**: `/content/animals/<id>.svg` (con `/` inicial).
- **`categoryId`**: el `id` de una categoría existente (`salvajes`, `agua`, `bichos`).
- **`favorite": true`** (opcional): lo destaca y lo pone primero.

**Categoría nueva:** agregar una entrada al array `categories` (`id`, `name`, `emoji`)
y usar ese `id` en el animal.

Ver también la sección **"Cómo agregar un animal"** en `CLAUDE.md`.
