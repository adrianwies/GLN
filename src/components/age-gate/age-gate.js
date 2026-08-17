import './age-gate.css'

const STORAGE_KEY = 'ageVerified'
const gate = document.querySelector('site-age-gate')

if (gate && document.documentElement.classList.contains('age-gate-required')) {
  const question = gate.querySelector('[data-age-question]')
  const denied = gate.querySelector('[data-age-denied]')
  const acceptButton = gate.querySelector('[data-age-accept]')
  const declineButton = gate.querySelector('[data-age-decline]')
  const retryButton = gate.querySelector('[data-age-retry]')
  const backgroundElements = [...document.body.children]
    .filter((element) => element !== gate && !element.matches('site-preloader'))

  const setBackgroundInert = (inert) => {
    backgroundElements.forEach((element) => {
      if (inert) element.setAttribute('inert', '')
      else element.removeAttribute('inert')
    })
  }

  const focusableElements = () => [...gate.querySelectorAll('button:not([disabled])')]
    .filter((element) => !element.closest('[hidden]'))

  setBackgroundInert(true)
  gate.setAttribute('aria-hidden', 'false')
  const showGate = () => requestAnimationFrame(() => {
      gate.classList.add('is-visible')
      acceptButton.focus({ preventScroll: true })
    })

  if (document.documentElement.classList.contains('is-loading')) {
    window.addEventListener('gln:preloader-hidden', showGate, { once: true })
  } else {
    showGate()
  }

  gate.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = focusableElements()
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })

  acceptButton.addEventListener('click', () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Si el navegador bloquea el almacenamiento, se permite esta navegación.
    }
    gate.classList.add('is-leaving')
    const finish = () => {
      setBackgroundInert(false)
      document.documentElement.classList.remove('age-gate-required')
      gate.remove()
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish()
    else window.setTimeout(finish, 450)
  })

  declineButton.addEventListener('click', () => {
    question.hidden = true
    denied.hidden = false
    gate.querySelector('.age-gate').setAttribute('aria-labelledby', 'age-gate-denied-title')
    retryButton.focus({ preventScroll: true })
  })

  retryButton.addEventListener('click', () => {
    denied.hidden = true
    question.hidden = false
    gate.querySelector('.age-gate').setAttribute('aria-labelledby', 'age-gate-title')
    acceptButton.focus({ preventScroll: true })
  })
} else {
  gate?.remove()
}
