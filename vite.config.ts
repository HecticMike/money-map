import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// When running on GitHub Actions, GITHUB_REPOSITORY looks like "username/repo"
// this code extracts the repo name and sets base to "/repo-name/"
// locally it will default to '/' so dev server works as expected.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'money-map';
const isActions = !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  base: isActions ? `/${repository}/` : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png'
      ],
      manifest: {
        name: 'Money Map',
        short_name: 'MoneyMap',
        description: 'Track spending, sync to Google Drive, and stay on budget offline.',
        theme_color: '#0f172a',
        background_color: '#f1f5f9',
        display: 'standalone',
        // Use a relative start_url so the PWA can be served from a subpath (GitHub Pages)
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'document' ||
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
