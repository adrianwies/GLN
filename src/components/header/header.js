import './header.css'

import '../cart-drawer/cart-drawer.js'
import { cartItemCount, readCart } from '../cart-drawer/cart-store.js'

const component = document.querySelector('site-header')

if (component) {
  const header = component.querySelector('header')
  const nav = component.querySelector('nav')
  const menu = component.querySelector('.menu')
  const explore = component.querySelector('.explore')
  const isCatalogPage = window.location.pathname.startsWith('/catalogo')
  const isAboutPage = window.location.pathname.startsWith('/nosotros')
  const isContactPage = window.location.pathname.startsWith('/contacto')
  const activePage = isCatalogPage
    ? 'catalogo'
    : isAboutPage
      ? 'nosotros'
      : isContactPage
        ? 'contacto'
        : 'inicio'

  component
    .querySelector('[data-page="' + activePage + '"]')
    ?.classList.add('page-active')

  if (isCatalogPage || isAboutPage || isContactPage) {
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
    component.querySelector('[data-cart-count]').textContent = cartItemCount(readCart())
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
