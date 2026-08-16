import './footer.css'

const footer = document.querySelector('site-footer')
const year = document.querySelector('[data-current-year]')

if (footer) {
  footer.removeAttribute('style')
  footer.classList.add('is-ready')
}

if (year) {
  year.textContent = new Date().getFullYear()
}
