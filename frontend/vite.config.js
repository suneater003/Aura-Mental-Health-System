import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Aura - Mental Health System',
        short_name: 'Aura',
        description: 'Your wellness companion.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/dummy-icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/dummy-icon.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})