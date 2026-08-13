import './cart-drawer.css'

const drawer = document.querySelector('[data-cart-drawer]')

if (drawer) {
  const backdrop = document.querySelector('[data-cart-backdrop]')
  let products = []

  const readSelection = () => {
    try { return JSON.parse(localStorage.getItem('gln-selection') || '[]') }
    catch { return [] }
  }

  const render = () => {
    const selectedSlugs = readSelection()
    const selected = products.filter((product) => selectedSlugs.includes(product.slug))
    drawer.querySelector('[data-cart-list]').innerHTML = selected.map((product) => `<article><img src="${product.image}" alt="${product.name}" /><div><small>${product.category} · ${product.volume}</small><h3>${product.name}</h3></div><button data-cart-remove="${product.slug}" aria-label="Quitar ${product.name}">×</button></article>`).join('')
    drawer.querySelector('[data-cart-empty]').hidden = Boolean(selected.length)
    const action = drawer.querySelector('[data-cart-action]')
    action.classList.toggle('disabled', !selected.length)
    action.href = selected.length ? `/?productos=${encodeURIComponent(selected.map((product) => product.name).join(', '))}#contacto` : '/catalogo/'
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
    const button = event.target.closest('[data-cart-remove]')
    if (!button) return
    const selection = readSelection().filter((slug) => slug !== button.dataset.cartRemove)
    localStorage.setItem('gln-selection', JSON.stringify(selection))
    window.dispatchEvent(new Event('gln-selection-change'))
    render()
  })
  window.addEventListener('gln-selection-change', render)
  window.addEventListener('storage', render)
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') open(false) })
  window.openGlnCart = () => open(true)
}
