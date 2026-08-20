import '../../src/global.css'
import './producto.css'
import '../../src/components/header/header.js'
import '../../src/components/footer/footer.js'
import '../../src/components/product-card/product-card.css?producto'
import { enableProductCardNavigation, renderProductCard } from '../../src/components/product-card/product-card.js'
import { changeCartQuantity, formatPrice, readCart } from '../../src/components/cart-drawer/cart-store.js'

const page = document.querySelector('#product-page')
const pathParts = window.location.pathname.split('/').filter(Boolean)
const slug = pathParts[0] === 'catalogo' && pathParts[1] === 'producto' ? pathParts[2] : new URLSearchParams(location.search).get('slug')

function updateMetadata(product) {
  const description = `${product.name} de ${product.brand}: ${product.description} Presentación ${product.volume}. Consulta disponibilidad en Perú.`
  const title = `${product.name} ${product.volume} | GLN Perú`
  const url = `https://gln.com.pe/catalogo/producto/${product.slug}/`
  const image = new URL(product.image, 'https://gln.com.pe').href
  document.title = title
  document.querySelector('meta[name="description"]').content = description
  document.querySelector('link[rel="canonical"]').href = url
  const setMeta = (selector, attribute, content) => document.querySelector(selector)?.setAttribute(attribute, content)
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[property="og:url"]', 'content', url)
  setMeta('meta[property="og:image"]', 'content', image)
  setMeta('meta[name="twitter:title"]', 'content', title)
  setMeta('meta[name="twitter:description"]', 'content', description)
  setMeta('meta[name="twitter:image"]', 'content', image)
  if (!document.querySelector('script[type="application/ld+json"]')) {
    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify({ '@context':'https://schema.org', '@type':'Product', name:product.name, description:product.description, image:[image], brand:{'@type':'Brand',name:product.brand}, category:product.category, countryOfOrigin:{'@type':'Country',name:product.origin}, sku:product.slug })
    document.head.appendChild(schema)
  }
}

function relatedProducts(product, products) {
  return products.filter((item) => item.slug !== product.slug).map((item) => {
    const sharedTags = item.tags.filter((tag) => product.tags.includes(tag)).length
    const score = (item.category === product.category ? 8 : 0) + (item.subtype === product.subtype ? 5 : 0) + sharedTags * 2 + (item.brand === product.brand ? 1 : 0)
    return { item, score }
  }).sort((a,b) => b.score - a.score || a.item.order - b.item.order).slice(0,4).map(({item}) => item)
}

function render(product, products) {
  let cart = readCart()
  const detail = document.querySelector('#product-detail')
  detail.style.setProperty('--tone', product.color); detail.classList.remove('loading-detail')
  document.querySelectorAll('[data-name]').forEach((element) => { element.textContent = product.name })
  document.querySelector('[data-kicker]').textContent = `${product.category} · ${product.volume}`
  document.querySelector('[data-description]').textContent = product.description
  document.querySelector('[data-price]').textContent = formatPrice(product.price)
  document.querySelector('[data-notes]').innerHTML = product.notes.map((note) => `<span>${note}</span>`).join('')
  document.querySelector('[data-notes]').insertAdjacentHTML('afterend', `<dl class="specifications"><div><dt>Tipo</dt><dd>${product.subtype}</dd></div><div><dt>Contenido</dt><dd>${product.volume}</dd></div><div><dt>Alcohol</dt><dd>${product.alcohol}</dd></div><div><dt>Origen</dt><dd>${product.origin}</dd></div></dl>`)
  const photo = document.querySelector('[data-photo]'); photo.src = product.image; photo.alt = product.name
  const logo = document.querySelector('[data-logo]'); logo.src = product.logo; logo.alt = product.brand; logo.dataset.brand = product.brand
  const addButton = document.querySelector('[data-add]'); addButton.disabled = false
  const output = document.querySelector('[data-detail-quantity]')
  const decrease = document.querySelector('[data-detail-decrease]')

  const updateQuantity = () => {
    const quantity = cart[product.slug] || 0
    output.textContent = quantity
    decrease.disabled = quantity === 0
    addButton.textContent = quantity ? 'Agregar otra unidad +' : 'Agregar al carrito +'
    addButton.classList.toggle('selected', quantity > 0)
  }
  const changeQuantity = (delta) => { cart = changeCartQuantity(product.slug, delta); updateQuantity() }
  addButton.addEventListener('click', () => changeQuantity(1))
  document.querySelector('[data-detail-increase]').addEventListener('click', () => changeQuantity(1))
  decrease.addEventListener('click', () => changeQuantity(-1))
  window.addEventListener('gln-selection-change', () => { cart = readCart(); updateQuantity() })
  updateQuantity()

  const related = relatedProducts(product, products)
  page.insertAdjacentHTML('beforeend', `<section class="related"><div class="related-head"><div><p class="tag">Sigue explorando</p><h2>Productos relacionados</h2></div><a href="/catalogo/">Ver todo el catálogo ↗</a></div><div class="product-grid related-grid">${related.map((item,index) => renderProductCard(item,{index,quantity:cart[item.slug] || 0})).join('')}</div></section>`)
  const relatedGrid = page.querySelector('.related-grid')
  enableProductCardNavigation(relatedGrid)
  relatedGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select]')
    if (!button) return
    cart = changeCartQuantity(button.dataset.select, 1)
    const quantity = cart[button.dataset.select] || 0
    button.classList.toggle('selected', quantity > 0)
    button.querySelector('[data-add-label]').textContent = `En carrito: ${quantity}`
  })
}

async function init() {
  try {
    const response = await fetch('/data/productos.json')
    if (!response.ok) throw new Error()
    const products = await response.json()
    const product = products.find((item) => item.slug === slug)
    if (!product) {
      document.title = 'Producto no encontrado | GLN'
      document.querySelector('meta[name="robots"]').content = 'noindex, follow'
      page.innerHTML = '<section class="not-found"><span>404</span><h1>Producto no encontrado</h1><p>La botella que buscas no está disponible en nuestro catálogo.</p><a href="/catalogo/">Volver al catálogo</a></section>'
      return
    }
    updateMetadata(product); render(product, products)
  } catch {
    page.innerHTML = '<section class="not-found"><h1>No pudimos cargar el producto</h1><a href="/catalogo/">Volver al catálogo</a></section>'
  }
}

init()
