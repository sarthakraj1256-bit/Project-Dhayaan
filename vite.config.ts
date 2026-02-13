import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-tooltip'],
          'vendor-query': ['@tanstack/react-query'],
          // Heavy feature chunks - loaded on demand
          'feature-3d': ['three', '@react-three/fiber', '@react-three/drei'],
          'feature-charts': ['recharts'],
        },
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'prompt', // Changed to prompt so we control the update flow
      injectRegister: false, // Disable auto-injection, we handle registration manually
      includeAssets: ['favicon.ico', 'og-image.png', 'robots.txt', 'pwa-icon-192.png', 'pwa-icon-512.png', 'sw-custom.js'],
      manifest: {
        name: 'Dhyaan - Temple Darshan & Spiritual Wellness',
        short_name: 'Dhyaan',
        description: 'Live temple darshan, meditation frequencies, and spiritual wellness. Experience sacred geometry, mantra chanting, and mindful practices.',
        theme_color: '#D4AF37',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['health', 'lifestyle', 'education'],
        shortcuts: [
          {
            name: 'Sonic Lab',
            short_name: 'Meditate',
            description: 'Start a meditation session',
            url: '/sonic-lab',
            icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Live Darshan',
            short_name: 'Darshan',
            description: 'Watch live temple streams',
            url: '/live-darshan',
            icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Mantrochar',
            short_name: 'Mantras',
            description: 'Learn sacred mantras',
            url: '/mantrochar',
            icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/og-image.png',
            sizes: '1920x1088',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dhyaan Home Screen'
          }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
        // Skip large chunks from precaching
        globIgnores: ['**/feature-3d*.js', '**/feature-charts*.js'],
        runtimeCaching: [
          // Google Fonts - Cache First
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Unsplash images - Cache First with long expiry
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Supabase Storage (audio files) - Cache First
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Supabase API - Network First with cache fallback
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          // JS/CSS chunks - Stale While Revalidate
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
