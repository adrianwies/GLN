import '../src/global.css'
import './nosotros.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  })
}, { threshold: 0.12 })

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
