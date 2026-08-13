import './header.css'

const component = document.querySelector('site-header')

if (component) {
  const header = component.querySelector('header')
  const nav = component.querySelector('nav')
  const menu = component.querySelector('.menu')
  const explore = component.querySelector('.explore')
  const isProductsPage = window.location.pathname.startsWith('/productos')
  const activePage = isProductsPage ? 'productos' : 'inicio'

  component
    .querySelector('[data-page="' + activePage + '"]')
    ?.classList.add('page-active')

  if (isProductsPage) {
    header.classList.add('solid')
    explore.href = '/#contacto'
    explore.textContent = 'Consultar ↗'
  } else {
    window.addEventListener(
      'scroll',
      () => header.classList.toggle('solid', window.scrollY > 50),
      { passive: true },
    )
  }

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
