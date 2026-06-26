import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

// Se publica en GitHub Pages bajo /dibujando-con-luci/. El base hace que todas las rutas
// de assets/JS apunten al subdirectorio correcto. En dev queda '/' igual.
const base = '/dibujando-con-luci/'

// PWA instalable + offline. Cachea el shell y el contenido (animales, manifest, sonidos).
export default defineConfig({
  base,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-maskable.svg', 'content/**/*'],
      manifest: {
        name: 'Dibujando con Luci',
        short_name: 'Luci',
        description: 'Colorear animales para jugar en tablet y celular',
        lang: 'es',
        theme_color: '#7c5cff',
        background_color: '#efe9ff',
        display: 'standalone',
        orientation: 'any',
        scope: base,
        start_url: base,
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,mp3,woff2}'],
        // Los animales (svg) viven en /content y se piden en runtime: cachear al vuelo.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith(`${base}content/`),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'contenido-luci' },
          },
        ],
      },
    }),
    // GitHub Pages no es un servidor SPA: para rutas profundas (recargar /colorear/koala
    // o abrir un deep-link) sirve 404.html. Emitimos una copia del index para que la app
    // arranque y el router resuelva la ruta del lado del cliente.
    {
      name: 'spa-404-fallback',
      enforce: 'post',
      generateBundle(_options, bundle) {
        const index = bundle['index.html']
        if (index && index.type === 'asset') {
          this.emitFile({ type: 'asset', fileName: '404.html', source: index.source })
        }
      },
    },
  ],
})
