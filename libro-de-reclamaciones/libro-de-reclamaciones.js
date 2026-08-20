import '../src/global.css'
import './libro-de-reclamaciones.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  }),
  { threshold: 0.06 },
)
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

const form = document.querySelector('[data-claim-form]')
const status = document.querySelector('[data-claim-status]')
const printButton = document.querySelector('[data-print]')
const now = new Date()
const reference = `GLN-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`

document.querySelector('[data-claim-date]').textContent = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(now)
document.querySelector('[data-claim-number]').textContent = reference

const bindCounter = (name, selector) => {
  const field = form.elements[name]
  const output = document.querySelector(selector)
  field.addEventListener('input', () => { output.textContent = field.value.length })
}
bindCounter('detalle', '[data-detail-count]')
bindCounter('pedido', '[data-request-count]')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  if (!form.checkValidity()) {
    form.reportValidity()
    status.textContent = 'Revisa los campos obligatorios antes de continuar.'
    status.className = 'claim-status error'
    return
  }

  status.innerHTML = `<strong>Hoja preparada: ${reference}</strong><span>La información fue validada en este dispositivo. Para que el registro sea recibido formalmente por GLN, este formulario debe conectarse al sistema de almacenamiento y correo de la empresa.</span>`
  status.className = 'claim-status success'
  printButton.disabled = false
})

printButton.addEventListener('click', () => window.print())
