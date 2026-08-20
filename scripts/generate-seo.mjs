import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_URL = 'https://gln.com.pe'
const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const products = JSON.parse(await readFile(resolve(root, 'public/data/productos.json'), 'utf8'))
const template = await readFile(resolve(dist, 'catalogo/producto/index.html'), 'utf8')

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const absolute = (path) => new URL(path, SITE_URL).href

for (const product of products) {
  const url = `${SITE_URL}/catalogo/producto/${product.slug}/`
  const title = `${product.name} ${product.volume} | GLN Perú`
  const description = `${product.name} de ${product.brand}: ${product.description} Presentación ${product.volume}. Consulta disponibilidad en Perú.`
  const image = absolute(product.image)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [image],
    sku: product.slug,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    countryOfOrigin: { '@type': 'Country', name: product.origin },
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo/` },
      { '@type': 'ListItem', position: 3, name: product.name, item: url },
    ],
  }
  const seo = [
    `<meta property="og:locale" content="es_PE" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="Grupo de Licores Nacionales" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(product.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`,
    `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`,
  ].join('')

  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta name="robots" content=".*?"\s*\/>/, `<meta name="robots" content="index, follow, max-image-preview:large" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace('</head>', `${seo}</head>`)

  const productDir = resolve(dist, 'catalogo/producto', product.slug)
  await mkdir(productDir, { recursive: true })
  await writeFile(resolve(productDir, 'index.html'), html)
}

const catalogPath = resolve(dist, 'catalogo/index.html')
const catalogHtml = await readFile(catalogPath, 'utf8')
const catalogSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/catalogo/#collection`,
  url: `${SITE_URL}/catalogo/`,
  name: 'Catálogo de licores y coctelería de GLN',
  inLanguage: 'es-PE',
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${SITE_URL}/catalogo/producto/${product.slug}/`,
    })),
  },
}
await writeFile(catalogPath, catalogHtml.replace('</head>', `<script type="application/ld+json">${JSON.stringify(catalogSchema)}</script></head>`))

const staticRoutes = [
  '/',
  '/catalogo/',
  '/nosotros/',
  '/contacto/',
  '/preguntas-frecuentes/',
  '/terminos-y-condiciones/',
  '/libro-de-reclamaciones/',
]
const routes = [...staticRoutes, ...products.map(({ slug }) => `/catalogo/producto/${slug}/`)]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${SITE_URL}${route}</loc><lastmod>2026-08-20</lastmod></url>`).join('\n')}\n</urlset>\n`
await writeFile(resolve(dist, 'sitemap.xml'), sitemap)
