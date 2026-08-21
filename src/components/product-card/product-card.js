import productCardMarkup from './product-card.html?raw'
import { cartQuantity, formatPrice } from '../cart-drawer/cart-store.js'

const templateHost = document.createElement('div')
templateHost.innerHTML = productCardMarkup
const productCardTemplate = templateHost.querySelector('#product-card-template')

export const productUrl = (product) => `/catalogo/producto/${product.slug}/`

export function renderProductCard(product, options = {}) {
  const { quantity = 0, index = 0 } = options
  const url = productUrl(product)
  const currentQuantity = cartQuantity({ [product.slug]: quantity }, product.slug)
  const fragment = productCardTemplate.content.cloneNode(true)
  const card = fragment.querySelector('.product-card')
  const visual = card.querySelector('.product-visual')
  const photo = card.querySelector('[data-product-photo]')
  const logo = card.querySelector('[data-product-logo]')
  const badge = card.querySelector('[data-product-badge]')
  const button = card.querySelector('[data-select]')

  card.dataset.productUrl = url
  card.setAttribute('aria-label', `Ver ${product.name}`)
  card.style.setProperty('--delay', `${(index % 6) * 45}ms`)
  visual.style.setProperty('--tone', product.color)
  photo.src = product.image
  photo.alt = product.name
  logo.src = product.logo
  logo.alt = product.brand
  logo.dataset.brand = product.brand
  card.querySelector('[data-product-specs]').textContent = `${product.category} · ${product.volume} · ${product.alcohol}`
  card.querySelector('[data-product-name]').textContent = product.name
  card.querySelector('[data-product-notes]').textContent = product.notes.join(' · ')
  card.querySelector('[data-product-price]').textContent = Number(product.price) > 0 ? formatPrice(product.price) : 'Consultar precio'
  card.querySelectorAll('[data-product-link]').forEach((link) => {
    link.href = url
    link.setAttribute('aria-label', `Ver ${product.name}`)
  })
  if (product.badge) badge.textContent = product.badge
  else badge.remove()
  button.dataset.select = product.slug
  button.classList.toggle('selected', currentQuantity > 0)
  button.setAttribute('aria-label', `Agregar una unidad de ${product.name}`)
  button.querySelector('[data-add-label]').textContent = currentQuantity ? `En carrito: ${currentQuantity}` : 'Agregar'
  button.querySelector('b').textContent = '+'

  const output = document.createElement('div')
  output.append(fragment)
  return output.innerHTML
}

export function enableProductCardNavigation(container) {
  container.addEventListener('click', (event) => {
    if (event.target.closest('a,button')) return
    const card = event.target.closest('[data-product-url]')
    if (card) window.location.href = card.dataset.productUrl
  })
  container.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-product-url]')) {
      event.preventDefault()
      window.location.href = event.target.dataset.productUrl
    }
  })
}
