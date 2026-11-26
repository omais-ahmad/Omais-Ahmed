import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// The site is served from the domain root on Netlify. Set VITE_BASE_PATH only when hosting
// under a sub-path (for example "/repo/" on GitHub Pages).
const base = normaliseBase(process.env.VITE_BASE_PATH ?? '/')

// Netlify provides the site's public address as URL during a build. Canonical links, the
// sitemap and social tags are built from VITE_SITE_URL, so pass it through unless it was set.
if (!process.env.VITE_SITE_URL && process.env.NETLIFY === 'true' && process.env.URL) {
  process.env.VITE_SITE_URL = process.env.URL
}

function normaliseBase(value: string): string {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
  },
  ssr: {
    // Bundle everything into the prerender entry so the script has no runtime resolution to do.
    noExternal: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
  },
})
