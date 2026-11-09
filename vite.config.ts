/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), '')
  const rawgApiKey = loadedEnv.RAWG_API_KEY ?? ''
  const rawgApiUrl = new URL(loadedEnv.VITE_RAWG_API_URL ?? 'https://api.rawg.io/api')
  const rawgApiPath = rawgApiUrl.pathname.replace(/\/+$/, '')

  return {
    plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@app': path.resolve(import.meta.dirname, './src/app'),
        '@pages': path.resolve(import.meta.dirname, './src/pages'),
        '@widgets': path.resolve(import.meta.dirname, './src/widgets'),
        '@features': path.resolve(import.meta.dirname, './src/features'),
        '@entities': path.resolve(import.meta.dirname, './src/entities'),
        '@shared': path.resolve(import.meta.dirname, './src/shared'),
      },
    },
    server: {
      proxy: {
        '/api/rawg': {
          target: rawgApiUrl.origin,
          changeOrigin: true,
          rewrite: (requestPath) =>
            rawgApiPath + requestPath.replace(/^\/api\/rawg/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyRequest) => {
              if (!rawgApiKey) return

              const upstreamUrl = new URL(proxyRequest.path, rawgApiUrl.origin)
              upstreamUrl.searchParams.set('key', rawgApiKey)
              proxyRequest.path = upstreamUrl.pathname + upstreamUrl.search
            })
          },
        },
      },
    },
    test: {
      environment: 'node',
      globals: false,
    },
  }
})
