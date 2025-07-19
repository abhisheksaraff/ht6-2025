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
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, 'src/contentScript.tsx'),
      },
      output: {
        entryFileNames: 'contentScript.js',
        format: 'iife',
        inlineDynamicImports: true,
      },
      external: [],
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
}) 