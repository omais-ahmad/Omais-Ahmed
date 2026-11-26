import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { BASE_PATH } from './lib/config'

const container = document.getElementById('root')
if (!container) throw new Error('Root element is missing')

const app = (
  <StrictMode>
    <BrowserRouter basename={BASE_PATH.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

/** The current URL as a route path ("/", "/projects/slug/"), comparable to data-prerendered. */
function currentRoute(): string {
  const base = BASE_PATH.replace(/\/$/, '')
  const path = window.location.pathname.slice(base.length) || '/'
  return path.endsWith('/') || path.endsWith('.html') ? path : `${path}/`
}

// Hydrate only markup that was prerendered for this exact URL. Anything else (the dev
// server, the admin shell, or a fallback page served for a different URL) is rendered fresh.
if (container.dataset.prerendered === currentRoute()) {
  hydrateRoot(container, app)
} else {
  container.replaceChildren()
  createRoot(container).render(app)
}
