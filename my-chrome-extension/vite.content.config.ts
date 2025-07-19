import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
    'process': '{}'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/contentScript.tsx'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'contentScript.js',
    },
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'contentScript.js',
      },
    },
    emptyOutDir: false,
  },
}) 