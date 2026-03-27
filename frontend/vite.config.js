import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // ✅ Fix build entry issue for Vercel
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },

  // ✅ Dev server proxy (works only locally)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // change if your backend runs on another port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})