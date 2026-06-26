# Medidas correctas de los dibujos

Guía para que un dibujo nuevo (line-art para colorear) ocupe bien el ancho y el
alto del área de dibujo, sin deformarse.

## Por qué importa

El área de dibujo es **siempre un cuadrado** (relación 1:1). El motor rasteriza
el SVG a un canvas interno de **900×900 px** con `drawImage(img, 0, 0, 900, 900)`,
es decir **estira el SVG a un cuadrado**. Si el archivo no es cuadrado, **se
deforma** (un dibujo apaisado se ve achatado, uno vertical se ve estirado).

## Reglas

- **Formato cuadrado, relación 1:1.** Usá `viewBox="0 0 400 400"` (es lo que ya
  usan koala, pato, pez, etc.).
- **Que el line-art llegue cerca de los bordes** del viewBox. Dejá un margen de
  **~10–20 px** para que el trazo (`stroke-width` ~7) no se corte. Si el dibujo
  tiene mucho aire interno, se va a ver chico aunque el archivo sea grande.
- **Contorno cerrado.** Cada región a colorear tiene que estar cerrada por
  trazos; si queda un hueco, el balde "se escapa".
- **Estilo del trazo:** contorno negro (`stroke="#1a1a1a"`, `stroke-width` ~7),
  `fill="none"`, fondo transparente. Pupilas/detalles negros pueden ir con
  `fill="#1a1a1a" stroke="none"`.
- El **tamaño en píxeles del archivo no importa** (es vectorial): lo que cuenta
  es el `viewBox` cuadrado y que el trazo ocupe el cuadro.

## Prompt de referencia para generar el line-art

Para crear el dibujo con un modelo de generación de imágenes, reemplazá
`[animals]` por el animal deseado (en inglés) y ajustá la acción/pose:

```
Flat black and white line art of a cute friendly [animals] clinging to a branch,
coloring book page style. Thick continuous solid black lines. Zero shading, zero
grayscale. Pure white background. High contrast. Geometric simplicity, clean
lines, no gaps in lines, large open areas for coloring.
```

Después de generar la imagen, pasala a SVG cuadrado (`viewBox="0 0 400 400"`)
respetando las reglas de arriba antes de sumarla al proyecto.

## Cómo se suma al proyecto

Ver la sección **"Cómo agregar un animal"** en `CLAUDE.md`: crear el SVG en
`public/content/animals/<id>.svg` y agregar la entrada en
`public/content/manifest.json`.
