import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// Hard-code the base path to your GitHub repo for Pages
var isActions = !!process.env.GITHUB_ACTIONS;
export default defineConfig({
    base: isActions ? '/money-map/' : '/', // <-- updated here
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.svg',
                'apple-touch-icon-v2.png',
                'icons/icon-192-v2.png',
                'icons/icon-512-v2.png'
            ],
            manifest: {
                name: 'Money Map',
                short_name: 'MoneyMap',
                description: 'Track spending, sync to Google Drive, and stay on budget offline.',
                theme_color: '#0f172a',
                background_color: '#f1f5f9',
                display: 'standalone',
                start_url: './', // keep relative for PWA on subpath
                scope: './',
                icons: [
                    { src: 'icons/icon-192-v2.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512-v2.png', sizes: '512x512', type: 'image/png' }
                ]
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.destination === 'document' ||
                                request.destination === 'script' ||
                                request.destination === 'style';
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'app-shell',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
                        }
                    },
                    {
                        urlPattern: function (_a) {
                            var url = _a.url;
                            return url.pathname.endsWith('.json');
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'data-cache',
                            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 }
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
