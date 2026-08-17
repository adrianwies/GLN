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
        const preloader = component('src/components/preloader/preloader.html')
        const preloaderCss = component('src/components/preloader/preloader.css')
        const preloaderBootstrap = `<script>document.documentElement.classList.add('is-loading');window.__glnPreloaderStartedAt=performance.now();try{window.__glnPreloaderNeedsMinimum=sessionStorage.getItem('initialLoaderShown')!=='true'}catch(e){window.__glnPreloaderNeedsMinimum=true}window.__glnPreloaderDone=false;window.__hideGlnPreloader=function(){if(window.__glnPreloaderDone)return;window.__glnPreloaderDone=true;clearTimeout(window.__glnPreloaderTimer);try{sessionStorage.setItem('initialLoaderShown','true')}catch(e){}var root=document.documentElement;var loader=document.querySelector('site-preloader');if(loader)loader.classList.add('is-leaving');setTimeout(function(){root.classList.remove('is-loading');if(loader)loader.remove();window.dispatchEvent(new Event('gln:preloader-hidden'))},450)};window.__glnPreloaderTimer=setTimeout(window.__hideGlnPreloader,8000)</script><style>${preloaderCss}</style><link rel="preload" as="image" href="/images/LogoGLN.png" fetchpriority="high">`
        const ageGate = component('src/components/age-gate/age-gate.html')
        const ageGateBootstrap = `<script>(function(){try{if(sessionStorage.getItem('ageVerified')!=='true')document.documentElement.classList.add('age-gate-required')}catch(e){document.documentElement.classList.add('age-gate-required')}})()</script><style>html.age-gate-required,html.age-gate-required body{background:#061f2b;overflow:hidden}html.age-gate-required body>:not(site-age-gate):not(site-preloader){visibility:hidden}</style>`

        return html
          .replace('<head>', `<head>${preloaderBootstrap}${ageGateBootstrap}`)
          .replace('<body>', `<body>${preloader}${ageGate}`)
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
        contacto: resolve(import.meta.dirname, 'contacto/index.html'),
      },
    },
  },
})

