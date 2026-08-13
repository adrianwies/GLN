import '../../src/global.css'
import './producto.css'
import '../../src/components/header/header.js'
import '../../src/components/footer/footer.js'
import '../../src/components/product-card/product-card.css?producto'
import { enableProductCardNavigation, readSelection, renderProductCard, saveSelection } from '../../src/components/product-card/product-card.js'

const page = document.querySelector('#product-page')
const pathParts = window.location.pathname.split('/').filter(Boolean)
const slug = pathParts[0] === 'catalogo' && pathParts[1] === 'producto' ? pathParts[2] : new URLSearchParams(location.search).get('slug')

function updateMetadata(product) {
  const description = `${product.name}, ${product.category} de ${product.brand}. Perfil ${product.notes.join(', ')}. Conoce la selección de GLN.`
  document.title = `${product.name} | GLN`
  document.querySelector('meta[name="description"]').content = description
  document.querySelector('link[rel="canonical"]').href = `${location.origin}/catalogo/producto/${product.slug}`
  const schema = document.createElement('script')
  schema.type = 'application/ld+json'
  schema.textContent = JSON.stringify({ '@context':'https://schema.org', '@type':'Product', name:product.name, description:product.description, image:[product.image], brand:{'@type':'Brand',name:product.brand}, category:product.category, countryOfOrigin:product.origin, sku:product.slug })
  document.head.appendChild(schema)
}

function relatedProducts(product, products) {
  return products.filter((item) => item.slug !== product.slug).map((item) => {
    const sharedTags = item.tags.filter((tag) => product.tags.includes(tag)).length
    const score = (item.category === product.category ? 8 : 0) + (item.subtype === product.subtype ? 5 : 0) + sharedTags * 2 + (item.brand === product.brand ? 1 : 0)
    return { item, score }
  }).sort((a,b) => b.score - a.score || a.item.order - b.item.order).slice(0,4).map(({item}) => item)
}

function render(product, products) {
  const selected = readSelection()
  const detail = document.querySelector('#product-detail')
  detail.style.setProperty('--tone', product.color); detail.classList.remove('loading-detail')
  document.querySelectorAll('[data-name]').forEach((element) => { element.textContent = product.name })
  document.querySelector('[data-kicker]').textContent = `${product.category} · ${product.volume}`
  document.querySelector('[data-description]').textContent = product.description
  document.querySelector('[data-notes]').innerHTML = product.notes.map((note) => `<span>${note}</span>`).join('')
  document.querySelector('[data-notes]').insertAdjacentHTML('afterend', `<dl class="specifications"><div><dt>Tipo</dt><dd>${product.subtype}</dd></div><div><dt>Contenido</dt><dd>${product.volume}</dd></div><div><dt>Alcohol</dt><dd>${product.alcohol}</dd></div><div><dt>Origen</dt><dd>${product.origin}</dd></div></dl>`)
  const photo = document.querySelector('[data-photo]'); photo.src = product.image; photo.alt = product.name
  const logo = document.querySelector('[data-logo]'); logo.src = product.logo; logo.alt = product.brand; logo.dataset.brand = product.brand
  const addButton = document.querySelector('[data-add]'); addButton.disabled = false
  addButton.classList.toggle('selected', selected.has(product.slug)); addButton.textContent = selected.has(product.slug) ? 'Agregado al carrito ✓' : 'Agregar al carrito +'
  addButton.addEventListener('click', (event) => {
    selected.has(product.slug) ? selected.delete(product.slug) : selected.add(product.slug)
    saveSelection(selected)
    event.currentTarget.classList.toggle('selected', selected.has(product.slug))
    event.currentTarget.textContent = selected.has(product.slug) ? 'Agregado al carrito ✓' : 'Agregar al carrito +'
  })
  const related = relatedProducts(product, products)
  page.insertAdjacentHTML('beforeend', `<section class="related"><div class="related-head"><div><p class="tag">Sigue explorando</p><h2>Productos relacionados</h2></div><a href="/catalogo/">Ver todo el catálogo ↗</a></div><div class="product-grid related-grid">${related.map((item,index) => renderProductCard(item,{index,selected:selected.has(item.slug)})).join('')}</div></section>`)
  const relatedGrid = page.querySelector('.related-grid')
  enableProductCardNavigation(relatedGrid)
  relatedGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select]')
    if (!button) return
    selected.has(button.dataset.select) ? selected.delete(button.dataset.select) : selected.add(button.dataset.select)
    saveSelection(selected)
    button.classList.toggle('selected', selected.has(button.dataset.select))
    button.querySelector('[data-add-label]').textContent = selected.has(button.dataset.select) ? 'Agregado' : 'Agregar'
    button.querySelector('b').textContent = selected.has(button.dataset.select) ? '' : '+'
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
      page.innerHTML = '<section class="not-found"><span>404</span><h1>Producto no encontrado</h1><p>La botella que buscas no está disponible en nuestro catálogo.</p><a href="/catalogo/">Volver al catálogo</a></section>'
      return
    }
    updateMetadata(product); render(product, products)
  } catch {
    page.innerHTML = '<section class="not-found"><h1>No pudimos cargar el producto</h1><a href="/catalogo/">Volver al catálogo</a></section>'
  }
}

init()

