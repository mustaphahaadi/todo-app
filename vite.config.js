import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Specify the port number
  },
  optimizeDeps: {
    exclude: ['chunk-DRWLMN53', 'chunk-G3PMV62Z', 'chunk-PJEEZAML']
  },
  // Clear the cache on startup
  cacheDir: '.vite'
})
