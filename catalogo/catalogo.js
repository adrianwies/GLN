import '../src/global.css'
import './catalogo.css'
import '../src/components/header/header.js'
import '../src/components/footer/footer.js'
import '../src/components/product-card/product-card.css?catalogo'
import { enableProductCardNavigation, readSelection, renderProductCard, saveSelection } from '../src/components/product-card/product-card.js'

const state = {
  products: [],
  category: 'Todos',
  brand: '',
  query: '',
  sort: 'featured',
  selection: readSelection(),
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
  grid.innerHTML = products.map((product,index) => renderProductCard(product,{index,selected:state.selection.has(product.slug)})).join('')
  grid.hidden = !products.length
  empty.hidden = Boolean(products.length)
  $('#results-count').textContent = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`
  $('#clear-filters').disabled = state.category === 'Todos' && !state.brand && !state.query
}


function resetFilters() {
  state.category = 'Todos'; state.brand = ''; state.query = ''
  $('#search').value = ''; $('#brand-filter').value = ''; $('#category-filter').value = 'Todos'
  render()
}

document.addEventListener('click', (event) => {
  const select = event.target.closest('[data-select]')
  if (select) { state.selection.has(select.dataset.select) ? state.selection.delete(select.dataset.select) : state.selection.add(select.dataset.select); saveSelection(state.selection) }
})

enableProductCardNavigation(grid)

$('#search').addEventListener('input', (event) => { state.query = event.target.value.trim(); render() })
$('#brand-filter').addEventListener('change', (event) => { state.brand = event.target.value; render() })
$('#category-filter').addEventListener('change', (event) => { state.category = event.target.value; render() })
$('#sort').addEventListener('change', (event) => { state.sort = event.target.value; render() })
$('#clear-filters').addEventListener('click', resetFilters)
$('#empty-state button').addEventListener('click', resetFilters)
window.addEventListener('gln-selection-change', () => { state.selection = readSelection(); render() })

async function init() {
  try {
    const response = await fetch('/data/productos.json')
    if (!response.ok) throw new Error('No se pudo cargar el catálogo')
    state.products = await response.json()
    const categories = ['Todos', ...new Set(state.products.map((product) => product.category))]
    $('#category-filter').insertAdjacentHTML('beforeend', categories.slice(1).map((category) => `<option value="${category}">${category} (${state.products.filter((p) => p.category === category).length})</option>`).join(''))
    const brands = [...new Set(state.products.map((product) => product.brand))].sort()
    $('#brand-filter').insertAdjacentHTML('beforeend', brands.map((brand) => `<option>${brand}</option>`).join(''))
    const requestedBrand = new URLSearchParams(window.location.search).get('marca')
    if (requestedBrand && brands.includes(requestedBrand)) {
      state.brand = requestedBrand
      $('#brand-filter').value = requestedBrand
    }
    render()
  } catch (error) {
    $('#results-count').textContent = error.message
    empty.hidden = false; grid.hidden = true
  }
}

startBrandStream()
init()
