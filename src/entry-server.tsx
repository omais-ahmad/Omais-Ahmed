import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { BASE_PATH, SITE_ORIGIN } from './lib/config'
import { initialContent } from './lib/content'
import { HeadContext, renderHeadTags, type HeadCollector } from './lib/seo'

/** Renders one route to static HTML. Used only by scripts/prerender.mjs at build time. */
export function render(route: string): { html: string; head: string } {
  const collector: HeadCollector = { tags: [] }
  const location = BASE_PATH.replace(/\/$/, '') + route
  const html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={collector}>
        <StaticRouter basename={BASE_PATH.replace(/\/$/, '')} location={location}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  )
  return { html, head: renderHeadTags(collector.tags) }
}

/** Everything the prerender script needs to know about the site. */
export const site = {
  origin: SITE_ORIGIN,
  basePath: BASE_PATH,
  projectSlugs: initialContent.projects.map((project) => project.slug),
}
