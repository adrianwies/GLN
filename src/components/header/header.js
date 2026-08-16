import './header.css'

import '../cart-drawer/cart-drawer.js'
import { cartItemCount, readCart } from '../cart-drawer/cart-store.js'

const component = document.querySelector('site-header')

if (component) {
  const header = component.querySelector('header')
  const nav = component.querySelector('nav')
  const menu = component.querySelector('.menu')
  const explore = component.querySelector('.explore')

  // Evita mostrar el logo, navegación y carrito antes de cargar sus estilos.
  component.removeAttribute('style')
  component.classList.add('is-ready')
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

  const setMenuOpen = (open) => {
    nav.classList.toggle('open', open)
    menu.classList.toggle('open', open)
    menu.setAttribute('aria-expanded', String(open))
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
    document.body.classList.toggle('menu-open', open)
  }

  menu.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('open'))
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuOpen(false)
    })
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setMenuOpen(false)
      menu.focus()
    }
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 850 && nav.classList.contains('open')) setMenuOpen(false)
  })
}
