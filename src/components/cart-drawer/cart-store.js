const STORAGE_KEY = 'gln-selection'

const normalizeQuantity = (value) => Math.max(0, Math.min(99, Number.parseInt(value, 10) || 0))

export function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (Array.isArray(stored)) {
      const migrated = stored.reduce((cart, slug) => {
        if (typeof slug === 'string' && slug) cart[slug] = (cart[slug] || 0) + 1
        return cart
      }, {})
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    }
    return Object.fromEntries(Object.entries(stored || {}).map(([slug, quantity]) => [slug, normalizeQuantity(quantity)]).filter(([, quantity]) => quantity > 0))
  } catch {
    return {}
  }
}

export function saveCart(cart) {
  const normalized = Object.fromEntries(Object.entries(cart).map(([slug, quantity]) => [slug, normalizeQuantity(quantity)]).filter(([, quantity]) => quantity > 0))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new Event('gln-selection-change'))
  return normalized
}

export function setCartQuantity(slug, quantity) {
  const cart = readCart()
  const normalized = normalizeQuantity(quantity)
  if (normalized) cart[slug] = normalized
  else delete cart[slug]
  return saveCart(cart)
}

export function changeCartQuantity(slug, delta = 1) {
  const cart = readCart()
  return setCartQuantity(slug, (cart[slug] || 0) + delta)
}

export const cartQuantity = (cart, slug) => normalizeQuantity(cart?.[slug])
export const cartItemCount = (cart = readCart()) => Object.values(cart).reduce((total, quantity) => total + normalizeQuantity(quantity), 0)
export const formatPrice = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value) || 0)