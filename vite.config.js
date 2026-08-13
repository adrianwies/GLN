import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        inicio: resolve(import.meta.dirname, 'index.html'),
        productos: resolve(import.meta.dirname, 'productos/index.html'),
      },
    },
  },
})


