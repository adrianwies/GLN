import './header.css'
import logoUrl from '../../assets/LogoGLN.png'

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || 'inicio'
    const fixed = this.hasAttribute('fixed')
    const links = [
      ['inicio', '/', 'Inicio'],
      ['productos', '/productos/', 'Productos'],
      ['nosotros', '/#nosotros', 'Nosotros'],
      ['contacto', '/#contacto', 'Contacto'],
    ]
    const navigation = links
      .map(([id, url, label]) => '<a class="' + (active === id ? 'page-active' : '') + '" href="' + url + '">' + label + '</a>')
      .join('')

    this.innerHTML =
      '<header class="' + (fixed ? 'solid' : '') + '">' +
        '<a class="logo" href="/"><img src="' + logoUrl + '" alt="Grupo de Licores Nacionales"></a>' +
        '<nav aria-label="Navegación principal">' + navigation + '</nav>' +
        '<a class="explore" href="' + (active === 'productos' ? '/#contacto' : '/productos/') + '">' +
          (active === 'productos' ? 'Consultar' : 'Explorar colección') + ' ↗' +
        '</a>' +
        '<button class="menu" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>' +
      '</header>'

    const header = this.querySelector('header')
    const nav = this.querySelector('nav')
    const menu = this.querySelector('.menu')

    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open')
      menu.setAttribute('aria-expanded', String(open))
    })

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('open'))
    })

    if (!fixed) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('solid', window.scrollY > 50)
      }, { passive: true })
    }
  }
}

customElements.define('site-header', SiteHeader)
