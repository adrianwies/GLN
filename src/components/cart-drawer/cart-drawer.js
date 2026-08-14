import './cart-drawer.css'
import { formatPrice, readCart, setCartQuantity } from './cart-store.js'

const drawer = document.querySelector('[data-cart-drawer]')
const WHATSAPP_NUMBER = '51908946740'

if (drawer) {
  const backdrop = document.querySelector('[data-cart-backdrop]')
  let products = []

  const render = () => {
    const cart = readCart()
    const selected = products.map((product) => ({ product, quantity: cart[product.slug] || 0 })).filter(({ quantity }) => quantity > 0)
    const totalUnits = selected.reduce((sum, { quantity }) => sum + quantity, 0)
    const total = selected.reduce((sum, { product, quantity }) => sum + Number(product.price || 0) * quantity, 0)

    drawer.querySelector('[data-cart-list]').innerHTML = selected.map(({ product, quantity }) => {
      const subtotal = Number(product.price || 0) * quantity
      return `<article>
        <img src="${product.image}" alt="${product.name}" />
        <div class="cart-item-copy"><small>${product.category} · ${product.volume}</small><h3>${product.name}</h3><span>${formatPrice(product.price)} c/u</span>
          <div class="cart-quantity" aria-label="Cantidad de ${product.name}"><button data-cart-decrease="${product.slug}" type="button" aria-label="Reducir ${product.name}">−</button><output>${quantity}</output><button data-cart-increase="${product.slug}" type="button" aria-label="Aumentar ${product.name}">+</button></div>
        </div>
        <div class="cart-item-end"><strong>${formatPrice(subtotal)}</strong><button class="cart-remove" data-cart-remove="${product.slug}" type="button" aria-label="Quitar ${product.name}">×</button></div>
      </article>`
    }).join('')

    drawer.querySelector('[data-cart-empty]').hidden = Boolean(selected.length)
    const summary = drawer.querySelector('[data-cart-summary]')
    summary.hidden = !selected.length
    drawer.querySelector('[data-cart-units]').textContent = totalUnits
    drawer.querySelector('[data-cart-products]').textContent = selected.length
    const totalBox = drawer.querySelector('[data-cart-total]')
    totalBox.hidden = !selected.length
    drawer.querySelector('[data-cart-total-value]').textContent = formatPrice(total)
    const action = drawer.querySelector('[data-cart-action]')
    action.classList.toggle('disabled', !selected.length)
    if (selected.length) {
      const lines = selected.flatMap(({ product, quantity }, index) => [
        `${index + 1}. ${product.name}`,
        `   Cantidad: ${quantity}`,
        `   Precio unitario: ${formatPrice(product.price)}`,
        `   Subtotal: ${formatPrice(Number(product.price) * quantity)}`,
        '',
      ])
      const message = [
        'Hola GLN 👋',
        'Quiero realizar el siguiente pedido:',
        '',
        ...lines,
        'RESUMEN DEL PEDIDO',
        `Total de unidades: ${totalUnits}`,
        `Total a pagar: ${formatPrice(total)}`,
        '',
        'Quedo atento a la confirmación. Gracias.',
      ].join('\n')
      action.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
      action.target = '_blank'
    } else {
      action.href = '/catalogo/'
      action.removeAttribute('target')
    }
  }

  const open = (show) => {
    drawer.classList.toggle('open', show)
    drawer.setAttribute('aria-hidden', String(!show))
    backdrop.hidden = !show
    document.body.classList.toggle('drawer-open', show)
    if (show) render()
  }

  fetch('/data/productos.json').then((response) => response.json()).then((data) => { products = data; render() })
  document.querySelector('site-header .cart-link')?.addEventListener('click', (event) => { event.preventDefault(); open(true) })
  drawer.querySelector('[data-cart-close]').addEventListener('click', () => open(false))
  backdrop.addEventListener('click', () => open(false))
  drawer.addEventListener('click', (event) => {
    const increase = event.target.closest('[data-cart-increase]')
    const decrease = event.target.closest('[data-cart-decrease]')
    const remove = event.target.closest('[data-cart-remove]')
    if (increase) setCartQuantity(increase.dataset.cartIncrease, (readCart()[increase.dataset.cartIncrease] || 0) + 1)
    else if (decrease) setCartQuantity(decrease.dataset.cartDecrease, (readCart()[decrease.dataset.cartDecrease] || 0) - 1)
    else if (remove) setCartQuantity(remove.dataset.cartRemove, 0)
  })
  window.addEventListener('gln-selection-change', render)
  window.addEventListener('storage', render)
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') open(false) })
  window.openGlnCart = () => open(true)
}