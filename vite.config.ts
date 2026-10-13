import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Keep HMR/dev untouched: no service worker during `npm run dev`.
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'app-icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'BuzzFed',
        short_name: 'BuzzFed',
        description: 'Find free food around Georgia Tech.',
        theme_color: '#003057', // GT Navy
        background_color: '#003057',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the built app shell only; keep storage minimal.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
});
