import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo: nevxrr/papa → https://nevxrr.github.io/papa/
export default defineConfig({
  plugins: [react()],
  base: '/papa/',
})
