import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace IP below with your Android IP if different
const BACKEND = 'http://192.168.1.5:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // forward /api/* to backend
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // forward /auth/* to backend (in case frontend still calls /auth)
      '/auth': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, '/api/auth')
      }
    }
  }
})
