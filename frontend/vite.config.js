import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Prompt user on service worker updates
      strategies: 'auto', // Auto-generate service worker with Workbox
      manifest: {
        name: 'Aura Wellness',
        short_name: 'Aura',
        description: 'AI-Powered Mental Health Support System',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['health', 'wellness', 'medical'],
        screenshots: [
          {
            src: '/icons/aura-screenshot-192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/icons/aura-screenshot-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: '/icons/aura-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/aura-icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/aura-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/aura-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Chat with Aura',
            short_name: 'Chat',
            description: 'Start a wellness conversation',
            url: '/dashboard?tab=chat',
            icons: [
              {
                src: '/icons/aura-icon-96.png',
                sizes: '96x96'
              }
            ]
          },
          {
            name: 'Log Mood',
            short_name: 'Mood',
            description: 'Log your current mood',
            url: '/dashboard?tab=mood',
            icons: [
              {
                src: '/icons/aura-icon-96.png',
                sizes: '96x96'
              }
            ]
          }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\./,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
})