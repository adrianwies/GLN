import './global.css'
import './style.css'
import './components/header/header.js'
import './components/footer/footer.js'

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    })
  },
  { threshold: 0.1 },
)

document.querySelectorAll('.reveal').forEach((element) => {
  observer.observe(element)
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  form.querySelector('output').textContent =
    'Gracias. Recibimos tu consulta y te contactaremos pronto.'
  form.reset()
})

