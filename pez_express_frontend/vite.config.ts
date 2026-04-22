import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.webp', 'logo-small.webp', 'hero.webp', 'robots.txt'],
      manifest: {
        name: 'Pez Express',
        short_name: 'PezExpress',
        description: 'Sistema de gestión para Pez Express',
        theme_color: '#0ea5e9',       // ajusta al color principal de tu app
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Archivos que el SW precachea al instalar
        globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,woff,woff2}'],
        // Rutas que NUNCA deben cachearse (API y WebSocket)
        navigateFallbackDenylist: [/^\/api/, /^\/ws/],
        runtimeCaching: [
          {
            // Cachea imágenes de platos con estrategia cache-first
            urlPattern: /\.(?:png|webp|jpg|jpeg|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
          {
            // Cachea JS/CSS con stale-while-revalidate
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
            },
          },
        ],
      },
    }),
  ],
  server: { host: true },
  define: { global: 'globalThis' },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom'],
          'charts':       ['recharts'],
          'motion':       ['framer-motion'],
          'stomp':        ['@stomp/stompjs', 'sockjs-client'],
        },
      },
    },
  },
})