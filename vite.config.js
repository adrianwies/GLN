import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const component = (path) =>
  readFileSync(resolve(import.meta.dirname, path), 'utf-8').replace(/^\uFEFF/, '')

export default defineConfig({
  plugins: [
    {
      name: 'html-components',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (/^\/catalogo\/producto\/[a-z0-9]+(?:-[a-z0-9]+)*\/?(?:\?.*)?$/.test(req.url || '')) req.url = '/catalogo/producto/index.html'
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (/^\/catalogo\/producto\/[a-z0-9]+(?:-[a-z0-9]+)*\/?(?:\?.*)?$/.test(req.url || '')) req.url = '/catalogo/producto/index.html'
          next()
        })
      },
      transformIndexHtml(html) {
        return html
          .replace('<!-- HEADER_COMPONENT -->', component('src/components/header/header.html'))
          .replace('<!-- FOOTER_COMPONENT -->', component('src/components/footer/footer.html'))
          .replace('<!-- CART_COMPONENT -->', component('src/components/cart-drawer/cart-drawer.html'))
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        inicio: resolve(import.meta.dirname, 'index.html'),
        catalogo: resolve(import.meta.dirname, 'catalogo/index.html'),
        producto: resolve(import.meta.dirname, 'catalogo/producto/index.html'),
        nosotros: resolve(import.meta.dirname, 'nosotros/index.html'),
      },
    },
  },
})

