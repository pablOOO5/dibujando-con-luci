# Animales pendientes (no cargados)

> Generado por la implementación de [`specs/05-cargar-animales-pendientes.md`](../specs/05-cargar-animales-pendientes.md).
> Estos SVG **existen** en `public/content/animals/` pero **no se agregaron** al `manifest.json`
> porque no pasaron la validación (fondo opaco que bloquearía el balde). Hay que arreglarlos
> aparte y, una vez corregidos, agregar su entrada al manifest.

## Criterio de validación usado

- **Proporción 3:2** (de `viewBox` o `width`/`height`). ✔ Todos los SVG de la carpeta cumplen (ratio 1.500).
- **Sin fondo opaco**: sin `<rect>` de fondo y sin un fill blanco/casi-blanco que cubra un área grande
  del canvas. Un fill blanco de área completa actúa como fondo y **bloquea el balde** (el flood-fill
  no puede salir de la región porque todo el interior ya está "pintado" de blanco opaco).

## Pendientes

| SVG | Categoría prevista | Motivo |
| --- | --- | --- |
| `conejo.svg` | mascotas | Tiene un path blanco (`rgb(253,253,253)`) cuyo bounding box cubre el **100% del canvas** → fondo blanco opaco. |
| `delfin.svg` | agua | Tiene un path blanco (`#fff`) que cubre el **100% del canvas** → fondo blanco opaco. |
| `mariposa.svg` | bichos | 31 paths blancos; el mayor cubre el **100% del canvas** → fondo blanco opaco. |
| `oveja.svg` | granja | 54 paths blancos; el mayor cubre el **100% del canvas** → fondo blanco opaco. |

## Cómo arreglarlos

Quitar del SVG el/los path(s) blanco(s) de fondo (dejar solo las líneas oscuras del contorno, con el
resto **transparente**, igual que `koala.svg`). Ver el formato correcto en
[`docs/medidas-de-los-dibujos.md`](medidas-de-los-dibujos.md). Una vez transparente el fondo y
verificado que el balde rellena por región, agregar la entrada en
`public/content/manifest.json` con su `categoryId` previsto.
