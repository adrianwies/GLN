import '../src/global.css'
import './catalogo.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'

const state = {
  products: [],
  category: 'Todos',
  brand: '',
  query: '',
  sort: 'featured',
  favorites: new Set(JSON.parse(localStorage.getItem('gln-favorites') || '[]')),
  selection: new Set(JSON.parse(localStorage.getItem('gln-selection') || '[]')),
}

const $ = (selector) => document.querySelector(selector)
const grid = $('#product-grid')
const empty = $('#empty-state')

function startBrandStream() {
  document.querySelectorAll('.brand-lane').forEach((lane, index) => {
    const duration = 48 + index * 5 + Math.random() * 2
    const controlledOffsets = [-7, -24, -39]
    lane.style.setProperty('--duration', `${duration}s`)
    lane.style.setProperty('--delay', `${controlledOffsets[index] - Math.random() * 1.5}s`)
  })
}

function productCard(product, index) {
  const favorite = state.favorites.has(product.slug)
  const selected = state.selection.has(product.slug)
  return `<article class="product-card reveal visible" style="--delay:${(index % 6) * 45}ms">
    <div class="product-visual" style="--tone:${product.color}">
      <img class="product-photo" src="${product.image}" alt="${product.name}" loading="lazy" />
      <img class="brand-logo" src="${product.logo}" alt="${product.brand}" loading="lazy" />
      ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
      <button class="favorite ${favorite ? 'active' : ''}" data-favorite="${product.slug}" aria-label="${favorite ? 'Quitar de' : 'Agregar a'} favoritos">${favorite ? '♥' : '♡'}</button>
      <a class="product-arrow" href="/producto/?slug=${product.slug}" aria-label="Ver ${product.name}">↗</a>
    </div>
    <div class="product-meta"><div><small>${product.category} · ${product.volume}</small><h3><a href="/producto/?slug=${product.slug}">${product.name}</a></h3><p>${product.notes.join(' · ')}</p></div><button class="add-button ${selected ? 'selected' : ''}" data-select="${product.slug}">${selected ? 'Agregado ✓' : 'Agregar +'}</button></div>
  </article>`
}

function filteredProducts() {
  const query = state.query.toLocaleLowerCase('es')
  const products = state.products.filter((product) => {
    const haystack = [product.name, product.brand, product.category, ...product.notes].join(' ').toLocaleLowerCase('es')
    return (state.category === 'Todos' || product.category === state.category) && (!state.brand || product.brand === state.brand) && (!query || haystack.includes(query))
  })
  return products.sort((a, b) => state.sort === 'name' ? a.name.localeCompare(b.name) : state.sort === 'category' ? a.category.localeCompare(b.category) : a.order - b.order)
}

function render() {
  const products = filteredProducts()
  grid.innerHTML = products.map(productCard).join('')
  grid.hidden = !products.length
  empty.hidden = Boolean(products.length)
  $('#results-count').textContent = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`
  $('#clear-filters').hidden = state.category === 'Todos' && !state.brand && !state.query
  document.querySelectorAll('[data-category]').forEach((button) => button.classList.toggle('active', button.dataset.category === state.category))
  renderSelection()
}

function renderSelection() {
  const selected = state.products.filter((product) => state.selection.has(product.slug))
  $('#selection-count').textContent = selected.length
  $('#selection-list').innerHTML = selected.map((product) => `<article><img src="${product.logo}" alt="" /><div><small>${product.category}</small><h3>${product.name}</h3></div><button data-remove="${product.slug}" aria-label="Quitar ${product.name}">×</button></article>`).join('')
  $('#drawer-empty').hidden = Boolean(selected.length)
  $('#quote-link').classList.toggle('disabled', !selected.length)
  $('#quote-link').href = selected.length ? `/?productos=${encodeURIComponent(selected.map((p) => p.name).join(', '))}#contacto` : '/#contacto'
  localStorage.setItem('gln-selection', JSON.stringify([...state.selection]))
}

function openDrawer(open) {
  $('#selection-drawer').classList.toggle('open', open)
  $('#selection-drawer').setAttribute('aria-hidden', String(!open))
  $('#drawer-backdrop').hidden = !open
  document.body.classList.toggle('drawer-open', open)
}

function resetFilters() {
  state.category = 'Todos'; state.brand = ''; state.query = ''
  $('#search').value = ''; $('#brand-filter').value = ''
  render()
}

document.addEventListener('click', (event) => {
  const favorite = event.target.closest('[data-favorite]')
  const select = event.target.closest('[data-select]')
  const remove = event.target.closest('[data-remove]')
  const category = event.target.closest('[data-category]')
  if (favorite) {
    state.favorites.has(favorite.dataset.favorite) ? state.favorites.delete(favorite.dataset.favorite) : state.favorites.add(favorite.dataset.favorite)
    localStorage.setItem('gln-favorites', JSON.stringify([...state.favorites])); render()
  }
  if (select) { state.selection.has(select.dataset.select) ? state.selection.delete(select.dataset.select) : state.selection.add(select.dataset.select); render() }
  if (remove) { state.selection.delete(remove.dataset.remove); render() }
  if (category) { state.category = category.dataset.category; render() }
})

$('#search').addEventListener('input', (event) => { state.query = event.target.value.trim(); render() })
$('#brand-filter').addEventListener('change', (event) => { state.brand = event.target.value; render() })
$('#sort').addEventListener('change', (event) => { state.sort = event.target.value; render() })
$('#clear-filters').addEventListener('click', resetFilters)
$('#empty-state button').addEventListener('click', resetFilters)
$('#open-selection').addEventListener('click', () => openDrawer(true))
$('#close-selection').addEventListener('click', () => openDrawer(false))
$('#drawer-backdrop').addEventListener('click', () => openDrawer(false))
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') openDrawer(false) })

async function init() {
  try {
    const response = await fetch('/data/productos.json')
    if (!response.ok) throw new Error('No se pudo cargar el catálogo')
    state.products = await response.json()
    const categories = ['Todos', ...new Set(state.products.map((product) => product.category))]
    $('#category-tabs').innerHTML = categories.map((category) => `<button type="button" data-category="${category}">${category}<sup>${category === 'Todos' ? state.products.length : state.products.filter((p) => p.category === category).length}</sup></button>`).join('')
    const brands = [...new Set(state.products.map((product) => product.brand))].sort()
    $('#brand-filter').insertAdjacentHTML('beforeend', brands.map((brand) => `<option>${brand}</option>`).join(''))
    render()
  } catch (error) {
    $('#results-count').textContent = error.message
    empty.hidden = false; grid.hidden = true
  }
}

startBrandStream()
init()
