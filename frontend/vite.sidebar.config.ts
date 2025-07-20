import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        sidebar: resolve(__dirname, 'public/sidebar.html')
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty the dist folder since we're building incrementally
    assetsInlineLimit: 0,
    sourcemap: false, // Disable sourcemaps to avoid TypeScript file references
  },
  base: './', // Use relative paths
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}) 