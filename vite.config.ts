import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  ssr: {
    // Don't externalize dependencies for SSR build
    noExternal: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  define: {
    // Ensure proper environment detection
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
