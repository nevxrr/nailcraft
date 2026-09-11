import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo: nevxrr/nailcraft → https://nevxrr.github.io/nailcraft/
export default defineConfig({
  plugins: [react()],
  base: '/nailcraft/',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
