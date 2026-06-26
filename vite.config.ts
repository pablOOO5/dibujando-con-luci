import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

// PWA instalable + offline. Cachea el shell y el contenido (animales, manifest, sonidos).
export default defineConfig({
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
        start_url: '/',
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
            urlPattern: ({ url }) => url.pathname.startsWith('/content/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'contenido-luci' },
          },
        ],
      },
    }),
  ],
})
