import './global.css'
import './style.css'
import './product-showcase.css'
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





const productCarousel = document.querySelector('.product-carousel')
const carouselDots = document.querySelectorAll('.carousel-dots button')

let dragging = false
let dragStartX = 0
let initialScroll = 0

productCarousel.scrollLeft = 0

const carouselEnd = () =>
  productCarousel.querySelector('.card').offsetWidth
const updateCarouselDots = () => {
  const isAtEnd = productCarousel.scrollLeft >= carouselEnd() / 2
  productCarousel.classList.toggle('show-end', isAtEnd)
  carouselDots.forEach((dot, index) => {
    dot.classList.toggle('active', index === Number(isAtEnd))
  })
}


productCarousel.addEventListener('pointerdown', (event) => {
  dragging = true
  dragStartX = event.clientX
  initialScroll = productCarousel.scrollLeft
  productCarousel.setPointerCapture(event.pointerId)
})

productCarousel.addEventListener('pointermove', (event) => {
  if (!dragging) return
  productCarousel.scrollLeft = initialScroll - (event.clientX - dragStartX)
})

productCarousel.addEventListener('pointerup', (event) => {
  dragging = false
  productCarousel.releasePointerCapture(event.pointerId)
  const destination =
    productCarousel.scrollLeft >= carouselEnd() / 2 ? carouselEnd() : 0
  productCarousel.scrollTo({ left: destination, behavior: 'smooth' })
})


productCarousel.addEventListener('scroll', updateCarouselDots, {
  passive: true,
})

carouselDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    productCarousel.scrollTo({
      left: index === 0 ? 0 : carouselEnd(),
      behavior: 'smooth',
    })
  })
})
const resetProductCarousel = () => {
  productCarousel.scrollTo({ left: 0, behavior: 'auto' })
  updateCarouselDots()
}

window.addEventListener('pageshow', resetProductCarousel)
requestAnimationFrame(resetProductCarousel)


const previousProductButton = document.querySelector('.carousel-arrow--prev')
const nextProductButton = document.querySelector('.carousel-arrow--next')

const toggleProductView = (direction) => {
  const isAtEnd = productCarousel.scrollLeft >= carouselEnd() / 2
  const goToEnd = direction > 0 ? !isAtEnd : !isAtEnd

  productCarousel.scrollTo({
    left: goToEnd ? carouselEnd() : 0,
    behavior: 'smooth',
  })
}

previousProductButton.addEventListener('click', () => toggleProductView(-1))
nextProductButton.addEventListener('click', () => toggleProductView(1))



