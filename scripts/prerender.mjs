// Build step 3: turns the client build into static HTML, one file per public route.
//
//   dist/index.html                    home page
//   dist/projects/<slug>/index.html    one page per published project
//   dist/admin/index.html              dashboard shell (client-rendered, noindex)
//   dist/404.html                      served by the host for unknown URLs
//   dist/sitemap.xml, dist/robots.txt
//
// The server bundle (dist-ssr) is produced by `vite build --ssr` and removed afterwards.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { render, site } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const template = await readFile(path.join(dist, 'index.html'), 'utf8')

const ROOT = '<div id="root"><!--app-html-->'

if (!template.includes(ROOT) || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html is missing the prerender placeholders')
}

/** route -> output file, relative to dist */
const pages = [
  { route: '/', file: 'index.html', indexed: true },
  ...site.projectSlugs.map((slug) => ({
    route: `/projects/${slug}/`,
    file: `projects/${slug}/index.html`,
    indexed: true,
  })),
  // The dashboard is client-rendered: only its <head> is prerendered.
  { route: '/admin/', file: 'admin/index.html', indexed: false, shell: true },
  { route: '/404.html', file: '404.html', indexed: false },
]

for (const page of pages) {
  const { html, head } = render(page.route)
  // data-prerendered tells the client which route this markup belongs to, so it only
  // hydrates when the URL matches (a 404 page served for some other URL is re-rendered).
  const body = page.shell ? '<div id="root">' : `<div id="root" data-prerendered="${page.route}">${html}`
  const output = template.replace('<!--app-head-->', head).replace(ROOT, body)
  const target = path.join(dist, page.file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, output)
  console.log(`prerendered ${page.route.padEnd(48)} ${(output.length / 1024).toFixed(1)} kB`)
}

const base = site.origin + site.basePath
const today = new Date().toISOString().slice(0, 10)
const urls = pages
  .filter((page) => page.indexed)
  .map(
    (page) =>
      `  <url>\n    <loc>${base}${page.route.replace(/^\//, '')}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${page.route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
  )
  .join('\n')

await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: ${site.basePath}admin/\n\nSitemap: ${base}sitemap.xml\n`,
)

await rm(ssrDir, { recursive: true, force: true })
console.log(`wrote sitemap.xml (${pages.filter((page) => page.indexed).length} urls) and robots.txt`)
