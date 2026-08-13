import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const component = (path) =>
  readFileSync(resolve(import.meta.dirname, path), 'utf-8').replace(/^\uFEFF/, '')

export default defineConfig({
  plugins: [
    {
      name: 'html-components',
      transformIndexHtml(html) {
        return html
          .replace('<!-- HEADER_COMPONENT -->', component('src/components/header/header.html'))
          .replace('<!-- FOOTER_COMPONENT -->', component('src/components/footer/footer.html'))
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        inicio: resolve(import.meta.dirname, 'index.html'),
        productos: resolve(import.meta.dirname, 'productos/index.html'),
      },
    },
  },
})

