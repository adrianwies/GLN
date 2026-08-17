const hidePreloader = () => {
  const startedAt = window.__glnPreloaderStartedAt ?? performance.now()
  const elapsed = performance.now() - startedAt
  const remaining = window.__glnPreloaderNeedsMinimum
    ? Math.max(0, 1000 - elapsed)
    : 0

  window.setTimeout(() => window.__hideGlnPreloader?.(), remaining)
}

if (document.readyState === 'complete') {
  requestAnimationFrame(hidePreloader)
} else {
  window.addEventListener('load', hidePreloader, { once: true })
}
