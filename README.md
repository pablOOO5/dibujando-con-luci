# 🐨 Dibujando con Luci

Juego de **colorear animales** para Luci, pensado para jugar en **tablet o celular**.
Es una app web instalable (PWA): gratis, funciona sin internet una vez abierta y no necesita
la Play Store.

## Qué tiene

- Animales por **categorías** (el 🐨 koala, su favorito, aparece destacado y primero).
- Pintar con **balde** (tocar para rellenar), **pincel** y **goma**, con **deshacer**.
- **Premio** al terminar cada dibujo (con sus favoritos: koala, papas 🍟 y hamburguesa 🍔).
- **Recordatorio de baño** suave y configurable.
- **Galería** para guardar y volver a ver los dibujos.
- **Ajustes para papás** (con un candado simple): sonidos, festejo y el recordatorio.

## Cómo correrlo en la compu

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Para probarlo desde la tablet/celular en la misma red WiFi:

```bash
npm run dev -- --host
```

y abrir en la tablet la dirección `http://<IP-de-tu-PC>:5173`.

## Instalarlo en la tablet (como app)

1. Publicá la app (ver abajo) o serví el build con `npm run build` y `npm run preview -- --host`.
2. En la tablet, abrí la URL en **Chrome**.
3. Menú ⋮ → **"Agregar a la pantalla de inicio"**. Queda como una app, a pantalla completa y
   funciona offline.

## Publicarlo gratis (recomendado para uso diario)

Cualquiera de estas opciones sirve y es gratis:

- **Netlify**: arrastrar la carpeta `dist/` (después de `npm run build`) a app.netlify.com.
- **Vercel** o **GitHub Pages**: build con `npm run build` y publicar `dist/`.

> Si lo publicás en un subdirectorio (ej. GitHub Pages `usuario.github.io/dibujando-con-luci/`),
> agregá `base: '/dibujando-con-luci/'` en `vite.config.ts`. Las rutas ya están preparadas para eso.

## Agregar más animales

El juego crece sin tocar programación: poné un dibujo nuevo en
`public/content/animals/` y agregá una línea en `public/content/manifest.json`.
El detalle está en `CLAUDE.md` (sección "Cómo agregar un animal").
