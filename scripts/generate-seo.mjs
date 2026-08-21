import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_URL = 'https://gln.com.pe'
const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const products = JSON.parse(await readFile(resolve(root, 'public/data/productos.json'), 'utf8'))
const template = await readFile(resolve(dist, 'catalogo/producto/index.html'), 'utf8')
const brandPages = [
  { slug: 'bola-ocho', name: 'Bola Ocho', title: 'Bola Ocho: cócteles listos para servir | GLN Perú', description: 'Conoce los cócteles listos para servir Bola Ocho disponibles en Perú. Explora presentaciones, perfiles y productos del catálogo GLN.', image: '/images/logo-bolaocho.webp' },
  { slug: 'soviet', name: 'Soviet', title: 'Soviet Vodka: productos y presentaciones | GLN Perú', description: 'Explora Soviet Vodka y sus presentaciones disponibles en Perú. Consulta características, productos y disponibilidad en el catálogo GLN.', image: '/images/logo-soviet.webp' },
  { slug: 'el-mariachi', name: 'El Mariachi', title: 'El Mariachi: licores y sabores | GLN Perú', description: 'Descubre los licores El Mariachi disponibles en Perú, sus sabores, presentaciones y usos para celebraciones y coctelería.', image: '/images/logo-mariachi.webp' },
  { slug: 'mr-jigger', name: 'Mr. Jigger', title: 'Mr. Jigger: licores frutales y bitters | GLN Perú', description: 'Explora los licores frutales y bitters Mr. Jigger para coctelería. Conoce sabores, presentaciones y disponibilidad en Perú.', image: '/images/logo-jigger.webp' },
  { slug: 'bandolero', name: 'Bandolero', title: 'Bandolero: jarabes, bitters y licores | GLN Perú', description: 'Conoce la línea Bandolero de jarabes, bitters y licores para coctelería. Explora productos y disponibilidad en Perú.', image: '/images/logo-bandolero.webp' },
]

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
  const keywords = [...new Set([product.name, `${product.name} Perú`, product.brand, product.category, product.subtype, ...product.notes, ...product.tags])].join(', ')
  const price = Number(product.price)
  const hasPrice = Number.isFinite(price) && price > 0
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    url,
    name: product.name,
    description: product.description,
    image: [image],
    sku: String(product.id),
    productID: product.slug,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    countryOfOrigin: { '@type': 'Country', name: product.origin },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Presentación', value: product.volume },
      { '@type': 'PropertyValue', name: 'Graduación alcohólica', value: product.alcohol },
      { '@type': 'PropertyValue', name: 'Tipo', value: product.subtype },
      { '@type': 'PropertyValue', name: 'Perfil', value: product.notes.join(', ') },
    ],
    ...(hasPrice ? {
      offers: {
        '@type': 'Offer',
        url,
        price: price.toFixed(2),
        priceCurrency: 'PEN',
      },
    } : {}),
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
    `<meta name="keywords" content="${escapeHtml(keywords)}" />`,
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
    .replace(/<meta name="robots" content=".*?"\s*\/>/, `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace('<span data-name>Producto</span>', `<span data-name>${escapeHtml(product.name)}</span>`)
    .replace('<p class="tag" data-kicker>Cargando colección</p>', `<p class="tag" data-kicker>${escapeHtml(product.category)} · ${escapeHtml(product.volume)}</p>`)
    .replace('<h1 data-name>Producto GLN</h1>', `<h1 data-name>${escapeHtml(product.name)}</h1>`)
    .replace('<p class="lead" data-description>Estamos preparando todos los detalles de esta botella.</p>', `<p class="lead" data-description>${escapeHtml(product.description)}</p>`)
    .replace('<div class="notes" data-notes></div>', `<div class="notes" data-notes>${product.notes.map((note) => `<span>${escapeHtml(note)}</span>`).join('')}</div>`)
    .replace('<img class="detail-photo" data-photo alt="" />', `<img class="detail-photo" data-photo src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" fetchpriority="high" decoding="async" />`)
    .replace('<img class="detail-logo" data-logo alt="" />', `<img class="detail-logo" data-logo src="${escapeHtml(product.logo)}" alt="${escapeHtml(product.brand)}" />`)
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
const catalogWithSchema = catalogHtml.replace('</head>', `<script type="application/ld+json">${JSON.stringify(catalogSchema)}</script></head>`)
await writeFile(catalogPath, catalogWithSchema)

for (const brand of brandPages) {
  const brandProducts = products.filter((product) => product.brand === brand.name)
  const url = `${SITE_URL}/catalogo/marca/${brand.slug}/`
  const image = absolute(brand.image)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: brand.title,
    description: brand.description,
    inLanguage: 'es-PE',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo/` },
        { '@type': 'ListItem', position: 3, name: brand.name, item: url },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: brandProducts.length,
      itemListElement: brandProducts.map((product, index) => ({
        '@type': 'ListItem', position: index + 1, name: product.name,
        url: `${SITE_URL}/catalogo/producto/${product.slug}/`,
      })),
    },
  }
  const html = catalogHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(brand.title)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${escapeHtml(brand.description)}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/, `<meta property="og:title" content="${escapeHtml(brand.title)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/, `<meta property="og:description" content="${escapeHtml(brand.description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:image" content=".*?"\s*\/>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(brand.title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(brand.description)}" />`)
    .replace(/<meta name="twitter:image" content=".*?"\s*\/>/, `<meta name="twitter:image" content="${image}" />`)
    .replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`)
  const brandDir = resolve(dist, 'catalogo/marca', brand.slug)
  await mkdir(brandDir, { recursive: true })
  await writeFile(resolve(brandDir, 'index.html'), html)
}

const staticRoutes = [
  '/',
  '/catalogo/',
  '/nosotros/',
  '/contacto/',
  '/preguntas-frecuentes/',
  '/terminos-y-condiciones/',
  '/libro-de-reclamaciones/',
]
const routes = [...staticRoutes, ...brandPages.map(({ slug }) => `/catalogo/marca/${slug}/`), ...products.map(({ slug }) => `/catalogo/producto/${slug}/`)]
const productByRoute = new Map(products.map((product) => [`/catalogo/producto/${product.slug}/`, product]))
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${routes.map((route) => {
  const product = productByRoute.get(route)
  const imageEntry = product ? `<image:image><image:loc>${absolute(product.image)}</image:loc><image:title>${escapeHtml(product.name)}</image:title></image:image>` : ''
  return `  <url><loc>${SITE_URL}${route}</loc><lastmod>2026-08-21</lastmod>${imageEntry}</url>`
}).join('\n')}\n</urlset>\n`
await writeFile(resolve(dist, 'sitemap.xml'), sitemap)
