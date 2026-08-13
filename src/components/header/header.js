import './header.css'

import '../cart-drawer/cart-drawer.js'

const component = document.querySelector('site-header')

if (component) {
  const header = component.querySelector('header')
  const nav = component.querySelector('nav')
  const menu = component.querySelector('.menu')
  const explore = component.querySelector('.explore')
  const isCatalogPage = window.location.pathname.startsWith('/catalogo')
  const activePage = isCatalogPage ? 'catalogo' : 'inicio'

  component
    .querySelector('[data-page="' + activePage + '"]')
    ?.classList.add('page-active')

  if (isCatalogPage) {
    header.classList.add('solid')
    explore.href = '#carrito'
  } else {
    window.addEventListener(
      'scroll',
      () => header.classList.toggle('solid', window.scrollY > 50),
      { passive: true },
    )
  }

  const updateCartCount = () => {
    let selection = []
    try { selection = JSON.parse(localStorage.getItem('gln-selection') || '[]') } catch {}
    component.querySelector('[data-cart-count]').textContent = selection.length
  }
  updateCartCount()
  window.addEventListener('gln-selection-change', updateCartCount)
  window.addEventListener('storage', updateCartCount)

  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open')
    menu.setAttribute('aria-expanded', String(open))
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open')
      menu.setAttribute('aria-expanded', 'false')
    })
  })
}
