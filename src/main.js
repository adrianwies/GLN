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
let activePointerId = null
let carouselDragMoved = false
let pendingBrandLink = null

productCarousel.scrollLeft = 0

const carouselStep = () => {
  const card = productCarousel.querySelector('.card')
  const styles = getComputedStyle(productCarousel)
  return card.offsetWidth + (Number.parseFloat(styles.columnGap || styles.gap) || 0)
}

const carouselEnd = () => productCarousel.scrollWidth - productCarousel.clientWidth
const updateCarouselDots = () => {
  const end = carouselEnd()
  const isAtEnd = end > 0 && productCarousel.scrollLeft >= end / 2
  productCarousel.classList.toggle('show-end', isAtEnd)
  carouselDots.forEach((dot, index) => {
    dot.classList.toggle('active', index === Number(isAtEnd))
  })
}


productCarousel.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse') return
  dragging = true
  pendingBrandLink = event.target.closest('.brand-image-link, .brand-name-link')
  activePointerId = event.pointerId
  dragStartX = event.clientX
  initialScroll = productCarousel.scrollLeft
  carouselDragMoved = false
  productCarousel.setPointerCapture(event.pointerId)
})

productCarousel.addEventListener('pointermove', (event) => {
  if (!dragging) return
  if (Math.abs(event.clientX - dragStartX) > 6) carouselDragMoved = true
  productCarousel.scrollLeft = initialScroll - (event.clientX - dragStartX)
})

productCarousel.addEventListener('pointerup', (event) => {
  if (!dragging || event.pointerId !== activePointerId) return
  const brandLink = pendingBrandLink
  const shouldNavigate = Boolean(brandLink) && !carouselDragMoved
  dragging = false
  activePointerId = null
  pendingBrandLink = null
  if (productCarousel.hasPointerCapture(event.pointerId)) {
    productCarousel.releasePointerCapture(event.pointerId)
  }
  if (shouldNavigate) {
    window.location.assign(brandLink.href)
    return
  }
  const step = carouselStep()
  const destination = Math.min(
    carouselEnd(),
    Math.max(0, Math.round(productCarousel.scrollLeft / step) * step),
  )
  productCarousel.scrollTo({ left: destination, behavior: 'smooth' })
})

productCarousel.addEventListener('pointercancel', () => {
  dragging = false
  activePointerId = null
  pendingBrandLink = null
  carouselDragMoved = false
})

productCarousel.addEventListener('click', (event) => {
  if (!carouselDragMoved) return
  event.preventDefault()
  event.stopPropagation()
  carouselDragMoved = false
}, true)


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
  const firstCard = productCarousel.querySelector('.card')
  const styles = getComputedStyle(productCarousel)
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0

  productCarousel.scrollBy({
    left: direction * (firstCard.offsetWidth + gap),
    behavior: 'smooth',
  })
}

previousProductButton.addEventListener('click', () => toggleProductView(-1))
nextProductButton.addEventListener('click', () => toggleProductView(1))



