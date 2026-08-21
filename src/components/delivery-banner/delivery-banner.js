import './delivery-banner.css'

const banner = document.querySelector('site-delivery-banner')

if (banner) {
  let frame = 0

  const syncHeaderOffset = () => {
    frame = 0
    const bannerHeight = banner.getBoundingClientRect().height
    const visibleHeight = Math.max(0, bannerHeight - window.scrollY)
    document.documentElement.style.setProperty('--delivery-visible-offset', `${visibleHeight}px`)
  }

  const requestSync = () => {
    if (!frame) frame = window.requestAnimationFrame(syncHeaderOffset)
  }

  banner.removeAttribute('style')
  syncHeaderOffset()
  window.addEventListener('scroll', requestSync, { passive: true })
  window.addEventListener('resize', requestSync, { passive: true })
}
