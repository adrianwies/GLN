import './footer.css'

const year = document.querySelector('[data-current-year]')

if (year) {
  year.textContent = new Date().getFullYear()
}
