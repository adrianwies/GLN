import '../src/global.css'
import './catalogo.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'
import '../src/components/product-card/product-card.css?catalogo'
import { enableProductCardNavigation, renderProductCard } from '../src/components/product-card/product-card.js'
import { changeCartQuantity, readCart } from '../src/components/cart-drawer/cart-store.js'

const brandRoutes = {
  'bola-ocho': { name: 'Bola Ocho', title: 'Bola Ocho: cócteles listos para servir | GLN Perú', description: 'Conoce los cócteles listos para servir Bola Ocho disponibles en Perú. Explora presentaciones, perfiles y productos del catálogo GLN.', line: 'Cócteles listos para servir con carácter y perfiles clásicos.' },
  soviet: { name: 'Soviet', title: 'Soviet Vodka: productos y presentaciones | GLN Perú', description: 'Explora Soviet Vodka y sus presentaciones disponibles en Perú. Consulta características, productos y disponibilidad en el catálogo GLN.', line: 'Vodka peruano para disfrutar puro o como base de coctelería.' },
  'el-mariachi': { name: 'El Mariachi', title: 'El Mariachi: licores y sabores | GLN Perú', description: 'Descubre los licores El Mariachi disponibles en Perú, sus sabores, presentaciones y usos para celebraciones y coctelería.', line: 'Licores versátiles para celebraciones, mezclas y nuevos sabores.' },
  'mr-jigger': { name: 'Mr. Jigger', title: 'Mr. Jigger: licores frutales y bitters | GLN Perú', description: 'Explora los licores frutales y bitters Mr. Jigger para coctelería. Conoce sabores, presentaciones y disponibilidad en Perú.', line: 'Licores frutales y bitters creados para una coctelería versátil.' },
  bandolero: { name: 'Bandolero', title: 'Bandolero: jarabes, bitters y licores | GLN Perú', description: 'Conoce la línea Bandolero de jarabes, bitters y licores para coctelería. Explora productos y disponibilidad en Perú.', line: 'Jarabes, bitters y licores para barras con personalidad.' },
}

const brandRouteEntries = Object.entries(brandRoutes)
const brandRouteByName = new Map(brandRouteEntries.map(([slug, brand]) => [brand.name, { ...brand, slug }]))
const brandFromLocation = () => {
  const match = window.location.pathname.match(/^\/catalogo\/marca\/([a-z0-9-]+)\/?$/)
  return match && brandRoutes[match[1]] ? { ...brandRoutes[match[1]], slug: match[1] } : null
}

const catalogSeo = {
  title: 'Catálogo de licores y coctelería | GLN Perú',
  description: 'Explora el catálogo de GLN Perú: cócteles listos para servir, vodka, licores, bitters, jarabes y productos para coctelería.',
  url: 'https://gln.com.pe/catalogo/',
}

const state = {
  products: [],
  category: 'Todos',
  brand: '',
  query: '',
  sort: 'featured',
  cart: readCart(),
}

const $ = (selector) => document.querySelector(selector)
const grid = $('#product-grid')
const empty = $('#empty-state')

function updateMeta(selector, content) {
  document.querySelector(selector)?.setAttribute('content', content)
}

function applyBrandPresentation(brand) {
  const seo = brand
    ? { title: brand.title, description: brand.description, url: `https://gln.com.pe/catalogo/marca/${brand.slug}/` }
    : catalogSeo
  document.title = seo.title
  document.querySelector('meta[name="description"]').content = seo.description
  document.querySelector('link[rel="canonical"]').href = seo.url
  updateMeta('meta[property="og:title"]', seo.title)
  updateMeta('meta[property="og:description"]', seo.description)
  updateMeta('meta[property="og:url"]', seo.url)
  updateMeta('meta[name="twitter:title"]', seo.title)
  updateMeta('meta[name="twitter:description"]', seo.description)
  const hero = document.querySelector('.catalog-hero')
  if (brand) {
    hero.querySelector('.tag').textContent = 'Colección de marca · GLN Perú'
    hero.querySelector('h1').innerHTML = `${brand.name}<br /><em>productos con identidad.</em>`
    hero.querySelector('.hero-copy>p:last-child').textContent = brand.line
  } else {
    hero.querySelector('.tag').textContent = 'Portafolio GLN · 2026'
    hero.querySelector('h1').innerHTML = 'Encuentra el carácter<br /><em>de tu próxima celebración.</em>'
    hero.querySelector('.hero-copy>p:last-child').textContent = 'Descubre nuestras marcas, compara perfiles y arma una selección a tu medida.'
  }
}

function syncBrandRoute(brandName, { replace = false } = {}) {
  const brand = brandRouteByName.get(brandName) || null
  const path = brand ? `/catalogo/marca/${brand.slug}/` : '/catalogo/'
  window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
  applyBrandPresentation(brand)
}

function setupCatalogSelect(select) {
  const field = select.closest('label')
  const menu = document.createElement('div')
  menu.className = 'catalog-select'
  menu.innerHTML = `<button class="catalog-select__trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span></span><i aria-hidden="true">⌄</i></button><div class="catalog-select__menu" role="listbox"></div>`
  select.classList.add('catalog-select__native')
  field.append(menu)

  const trigger = menu.querySelector('.catalog-select__trigger')
  const list = menu.querySelector('.catalog-select__menu')
  const sync = () => {
    const selected = select.options[select.selectedIndex]
    trigger.querySelector('span').textContent = selected?.textContent || ''
    list.querySelectorAll('[role="option"]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.value === select.value)))
  }
  const close = () => { menu.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false') }
  const open = () => {
    document.querySelectorAll('.catalog-select.open').forEach((item) => item !== menu && item.querySelector('.catalog-select__trigger').click())
    menu.classList.add('open'); trigger.setAttribute('aria-expanded', 'true')
  }

  list.innerHTML = [...select.options].map((option) => `<button type="button" role="option" data-value="${option.value}" aria-selected="false">${option.textContent}</button>`).join('')
  trigger.addEventListener('click', () => menu.classList.contains('open') ? close() : open())
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); list.querySelector('[aria-selected="true"]')?.focus() }
  })
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]')
    if (!option) return
    select.value = option.dataset.value
    select.dispatchEvent(new Event('change', { bubbles: true }))
    close(); trigger.focus()
  })
  select.addEventListener('change', sync)
  select.syncCatalogSelect = sync
  sync()
}

function syncCatalogSelect(id) { $(id).syncCatalogSelect?.() }

function setupMobileFilters() {
  const tools = $('.catalog-tools')
  const fields = $('#catalog-filter-fields')
  const toggle = $('#filter-toggle')
  if (!tools || !fields || !toggle) return

  const setOpen = (open) => {
    tools.classList.toggle('filters-open', open)
    toggle.setAttribute('aria-expanded', String(open))
  }

  toggle.addEventListener('click', () => setOpen(!tools.classList.contains('filters-open')))
  window.addEventListener('resize', () => {
    if (window.innerWidth > 650) setOpen(false)
  })
}

function keepCatalogToolsVisible() {
  const tools = $('.catalog-tools')
  const marker = document.createElement('div')
  tools.before(marker)
  let fixed = false

  const update = () => {
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) + 10
    const headerHeight = document.querySelector('site-header header')?.getBoundingClientRect().height || offset
    document.documentElement.style.setProperty('--catalog-gap-top', `${headerHeight}px`)
    document.documentElement.style.setProperty('--catalog-gap-height', `${Math.max(0, offset - headerHeight)}px`)
    if (!fixed && tools.getBoundingClientRect().top <= offset) {
      const bounds = tools.getBoundingClientRect()
      marker.style.height = `${tools.offsetHeight}px`
      tools.style.width = `${bounds.width}px`
      tools.style.left = `${bounds.left}px`
      tools.classList.add('catalog-tools--fixed')
      document.body.classList.add('catalog-tools-stuck')
      fixed = true
    } else if (fixed && marker.getBoundingClientRect().top > offset) {
      tools.classList.remove('catalog-tools--fixed')
      document.body.classList.remove('catalog-tools-stuck')
      tools.style.removeProperty('width'); tools.style.removeProperty('left')
      marker.style.removeProperty('height')
      fixed = false
    } else if (fixed) {
      const bounds = marker.getBoundingClientRect()
      tools.style.width = `${bounds.width}px`
      tools.style.left = `${bounds.left}px`
    }
  }

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

setupMobileFilters()

function startBrandStream() {
  document.querySelectorAll('.brand-lane').forEach((lane, index) => {
    const duration = 50 + index * 5
    const controlledOffsets = [-7, -24, -39]
    lane.style.setProperty('--duration', `${duration}s`)
    lane.style.setProperty('--delay', `${controlledOffsets[index]}s`)
  })
}

function filteredProducts() {
  const query = state.query.toLocaleLowerCase('es')
  const products = state.products.filter((product) => {
    const haystack = [product.name, product.brand, product.category, ...product.notes].join(' ').toLocaleLowerCase('es')
    return (state.category === 'Todos' || product.category === state.category) && (!state.brand || product.brand === state.brand) && (!query || haystack.includes(query))
  })
  return products.sort((a, b) => state.sort === 'name'
    ? a.name.localeCompare(b.name)
    : state.sort === 'category'
      ? a.category.localeCompare(b.category) || a.order - b.order
      : Number(b.featured) - Number(a.featured) || a.order - b.order)
}

function render() {
  const products = filteredProducts()
  grid.innerHTML = products.map((product,index) => renderProductCard(product,{index,quantity:state.cart[product.slug] || 0})).join('')
  grid.hidden = !products.length
  empty.hidden = Boolean(products.length)
  $('#results-count').textContent = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`
  $('#clear-filters').disabled = state.category === 'Todos' && !state.brand && !state.query
}


function resetFilters() {
  state.category = 'Todos'; state.brand = ''; state.query = ''
  $('#search').value = ''; $('#brand-filter').value = ''; $('#category-filter').value = 'Todos'
  syncCatalogSelect('#brand-filter'); syncCatalogSelect('#category-filter')
  syncBrandRoute('')
  render()
}

document.addEventListener('click', (event) => {
  const select = event.target.closest('[data-select]')
  if (select) { state.cart = changeCartQuantity(select.dataset.select, 1); render() }
  if (!event.target.closest('.catalog-select')) document.querySelectorAll('.catalog-select.open').forEach((menu) => menu.querySelector('.catalog-select__trigger').click())
})

enableProductCardNavigation(grid)

$('#search').addEventListener('input', (event) => { state.query = event.target.value.trim(); render() })
$('#brand-filter').addEventListener('change', (event) => { state.brand = event.target.value; syncBrandRoute(state.brand); render() })
$('#category-filter').addEventListener('change', (event) => { state.category = event.target.value; render() })
$('#sort').addEventListener('change', (event) => { state.sort = event.target.value; render() })
$('#clear-filters').addEventListener('click', resetFilters)
$('#empty-state button').addEventListener('click', resetFilters)
window.addEventListener('gln-selection-change', () => { state.cart = readCart(); render() })
window.addEventListener('popstate', () => {
  const brand = brandFromLocation()
  state.brand = brand?.name || ''
  $('#brand-filter').value = state.brand
  syncCatalogSelect('#brand-filter')
  applyBrandPresentation(brand)
  render()
})

async function init() {
  try {
    const response = await fetch('/data/productos.json')
    if (!response.ok) throw new Error('No se pudo cargar el catálogo')
    state.products = await response.json()
    const categories = ['Todos', ...new Set(state.products.map((product) => product.category))]
    $('#category-filter').insertAdjacentHTML('beforeend', categories.slice(1).map((category) => `<option value="${category}">${category} (${state.products.filter((p) => p.category === category).length})</option>`).join(''))
    const brands = [...new Set(state.products.map((product) => product.brand))].sort()
    $('#brand-filter').insertAdjacentHTML('beforeend', brands.map((brand) => `<option>${brand}</option>`).join(''))
    const pathBrand = brandFromLocation()
    const requestedBrand = pathBrand?.name || new URLSearchParams(window.location.search).get('marca')
    if (requestedBrand && brands.includes(requestedBrand)) {
      state.brand = requestedBrand
      $('#brand-filter').value = requestedBrand
      syncBrandRoute(requestedBrand, { replace: true })
    } else {
      applyBrandPresentation(null)
    }
    document.querySelectorAll('.catalog-tools select').forEach(setupCatalogSelect)
    render()
  } catch (error) {
    $('#results-count').textContent = error.message
    empty.hidden = false; grid.hidden = true
  }
}

startBrandStream()
keepCatalogToolsVisible()
init()
