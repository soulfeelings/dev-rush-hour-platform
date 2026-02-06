/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

import { playwright } from '@vitest/browser-playwright'

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [svgr(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@api': path.resolve(__dirname, './src/api'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@data': path.resolve(__dirname, './src/data'),
        '@features': path.resolve(__dirname, './src/features'),
        '@locales': path.resolve(__dirname, './src/locales'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@types': path.resolve(__dirname, './src/types'),
        '@ui': path.resolve(__dirname, './src/ui'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    build: {
      sourcemap: true,
    },
    optimizeDeps: {
      include: ['leaflet.markercluster'],
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      port: 5173,
      // Needed for Docker
      strictPort: true,
      hmr: {
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      projects: [
        {
          extends: true,
          plugins: [],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                {
                  browser: 'chromium',
                },
              ],
            },
            setupFiles: ['.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  }
})
