// Optional build step: snapshots the published content from Supabase into
// src/content/snapshot.json so that the prerendered HTML (what search engines read)
// matches what was last edited in the admin dashboard.
//
// Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, or with an empty database, the
// snapshot is reset to null and the build uses the bundled content in src/content/seed.ts.
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/content/snapshot.json')
const url = (process.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '')
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? ''

async function save(snapshot, reason) {
  await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(reason)
}

if (!url || !anonKey) {
  await save(null, 'Supabase is not configured: the build will use the bundled content.')
  process.exit(0)
}

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` }

async function get(query) {
  const response = await fetch(`${url}/rest/v1/${query}`, { headers })
  if (!response.ok) throw new Error(`${query.split('?')[0]} responded with ${response.status}`)
  return response.json()
}

try {
  const [items, singletons] = await Promise.all([
    get('content_items?select=id,collection,data,position,published&published=eq.true&order=position.asc'),
    get('content_singletons?select=key,data'),
  ])
  if (items.length === 0 && singletons.length === 0) {
    await save(null, 'The database is empty: the build will use the bundled content.')
  } else {
    await save({ items, singletons }, `Snapshot written: ${items.length} items, ${singletons.length} singletons.`)
  }
} catch (error) {
  // A backend outage must not take the site down with it: fall back to bundled content.
  await save(null, `Could not read from Supabase (${error.message}): the build will use the bundled content.`)
}
