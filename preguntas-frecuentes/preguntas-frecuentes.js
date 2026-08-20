import '../src/global.css'
import './preguntas-frecuentes.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  }),
  { threshold: 0.08 },
)

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

document.querySelectorAll('.faq-item').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return
    item.closest('.faq-list')?.querySelectorAll('.faq-item[open]').forEach((openItem) => {
      if (openItem !== item) openItem.removeAttribute('open')
    })
  })
})
