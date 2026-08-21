import '../src/global.css'
import './contacto.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'
import emailjs from '@emailjs/browser'

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  }),
  { threshold: 0.1 },
)

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))

const form = document.querySelector('[data-contact-form]')
const interestSelect = form?.querySelector('select[name="interes"]')

function setupInterestSelect(select) {
  if (!select) return

  const field = select.closest('label')
  const menu = document.createElement('div')

  menu.className = 'contact-select'

  menu.innerHTML = `
    <button
      class="contact-select__trigger"
      type="button"
      aria-haspopup="listbox"
      aria-expanded="false"
    >
      <span></span>
      <i aria-hidden="true"></i>
    </button>

    <div
      class="contact-select__menu"
      role="listbox"
    ></div>
  `

  select.classList.add('contact-select__native')
  field.append(menu)

  const trigger = menu.querySelector('.contact-select__trigger')
  const list = menu.querySelector('.contact-select__menu')

  const sync = () => {
    trigger.querySelector('span').textContent =
      select.options[select.selectedIndex]?.textContent || ''

    list.querySelectorAll('[role="option"]').forEach((option) => {
      option.setAttribute(
        'aria-selected',
        String(option.dataset.value === select.value)
      )
    })
  }

  const close = () => {
    menu.classList.remove('open')
    trigger.setAttribute('aria-expanded', 'false')
  }

  const open = () => {
    menu.classList.add('open')
    trigger.setAttribute('aria-expanded', 'true')
  }

  list.innerHTML = [...select.options]
    .map(
      (option) => `
        <button
          type="button"
          role="option"
          data-value="${option.value}"
          aria-selected="false"
        >
          ${option.textContent}
        </button>
      `
    )
    .join('')

  trigger.addEventListener('click', () =>
    menu.classList.contains('open') ? close() : open()
  )

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()

    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault()
      open()
    }
  })

  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]')

    if (!option) return

    select.value = option.dataset.value

    select.dispatchEvent(
      new Event('change', {
        bubbles: true,
      })
    )

    close()
    trigger.focus()
  })

  select.addEventListener('change', sync)

  select.syncContactSelect = sync

  sync()

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.contact-select')) close()
  })
}

setupInterestSelect(interestSelect)

/* =========================================
   EMAILJS
========================================= */

const EMAILJS_SERVICE_ID = 'service_sjzvecr'
const EMAILJS_TEMPLATE_ID = 'template_zr78hq4'
const EMAILJS_PUBLIC_KEY = 'BA6c_KJbqOFJ12iBBxzp8'

form?.addEventListener('submit', async (event) => {
  event.preventDefault()

  const output = form.querySelector('output')
  const submitButton = form.querySelector('button[type="submit"]')

  // Evita envíos dobles
  submitButton.disabled = true
  submitButton.dataset.originalText = submitButton.innerHTML
  submitButton.innerHTML = 'Enviando...'

  output.textContent = 'Enviando consulta...'

  try {
    await emailjs.sendForm(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      form,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    )

    output.textContent =
      'Gracias. Recibimos tu consulta y te contactaremos pronto.'

    form.reset()

    requestAnimationFrame(() => {
      interestSelect?.syncContactSelect?.()
    })

  } catch (error) {
    console.error('EmailJS error:', error)

    output.textContent =
      'No pudimos enviar tu consulta. Inténtalo nuevamente.'

  } finally {
    submitButton.disabled = false
    submitButton.innerHTML = submitButton.dataset.originalText
  }
})