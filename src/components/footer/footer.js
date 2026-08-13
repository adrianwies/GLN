import './footer.css'

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear()
    this.innerHTML =
      '<footer>' +
        '<b>GLN.</b>' +
        '<div>Grupo de Licores Nacionales S.A.C.<br>Lima, Perú</div>' +
        '<div>Instagram · Facebook<br>ventas@gln.com.pe</div>' +
        '<small>© ' + year + ' GLN. Toma con responsabilidad. Prohibida la venta de alcohol a menores de edad.</small>' +
      '</footer>'
  }
}

customElements.define('site-footer', SiteFooter)
