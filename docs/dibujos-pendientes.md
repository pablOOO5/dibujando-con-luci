# Dibujos pendientes

Dibujos que **no se cargaron** al juego porque no pasaron la validación del motor de colorear
(ver [`docs/medidas-de-los-dibujos.md`](medidas-de-los-dibujos.md)). El validador de la skill
`/cargar-nuevas-imagenes` los dejó afuera. Hay que arreglarlos a mano y volver a correr la skill.

## Cómo arreglarlos

El motor necesita SVG **3:2 (`viewBox 0 0 600 400`) con fondo transparente**. El error más
común es un **fill blanco que cubre todo el canvas**: actúa como fondo opaco y **bloquea el
balde** (el flood-fill no puede entrar). Solución: quitar ese rectángulo/relleno de fondo del
SVG y dejarlo transparente, sin tocar las líneas del contorno.

## Pendientes

| archivo | categoría prevista | motivo |
|---|---|---|
| `public/content/animals/conejo.svg` | Mascotas 🐶 (a confirmar) | fill blanco cubre 100% del canvas (fondo opaco que bloquea el balde) |
| `public/content/animals/delfin.svg` | Del agua 🦆 (a confirmar) | fill blanco cubre 100% del canvas (fondo opaco que bloquea el balde) |
| `public/content/animals/mariposa.svg` | Bichitos 🦋 (a confirmar) | fill blanco cubre 100% del canvas (fondo opaco que bloquea el balde) |
| `public/content/animals/oveja.svg` | De la granja 🐄 (a confirmar) | fill blanco cubre 100% del canvas (fondo opaco que bloquea el balde) |
