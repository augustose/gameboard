import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['dragonfly.png', 'turix_logo.jpg'],
      manifest: {
        name: 'iTurix Scoreboard',
        short_name: 'iTurix',
        description: 'Scoreboard for Rummy and Continental',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'dragonfly.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'dragonfly.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
})
