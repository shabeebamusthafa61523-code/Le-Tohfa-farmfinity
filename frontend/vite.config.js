import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Ensure react plugin is imported
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // This catches any request starting with /api and sends it to your Node.js server
      '/api': {
        target: 'http://localhost:5000', // Change to 8000 if that's your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})