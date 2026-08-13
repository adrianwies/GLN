import '../src/global.css'
import './productos.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'

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
