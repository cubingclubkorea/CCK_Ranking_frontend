import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api/v1': {
        target: 'https://ranking.cubingclub.com',
        changeOrigin: true,
        secure: true,
      },
      '/oauth2': {
        target: 'https://auth.cubingclub.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
