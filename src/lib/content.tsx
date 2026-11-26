import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { seed } from '@/content/seed'
import snapshot from '@/content/snapshot.json'
import type { SiteContent } from '@/content/types'
import { supabaseConfig } from './config'
import { assembleContent, publishedOnly, type ItemRow, type SingletonRow } from './content-mapping'

/** Rows saved by `npm run content:pull`, or null when the build should use the bundled content. */
const saved = snapshot as { items: ItemRow[]; singletons: SingletonRow[] } | null

/** Content available at build time: the database snapshot when there is one, otherwise the seed. */
export const initialContent: SiteContent = publishedOnly(
  saved ? assembleContent(saved.items, saved.singletons, seed) : seed,
)

const ContentContext = createContext<SiteContent>(initialContent)

/** Reads published content straight from the Supabase REST API (no SDK on the public site). */
export async function fetchPublicContent(signal?: AbortSignal): Promise<SiteContent | null> {
  if (!supabaseConfig) return null
  const { url, anonKey } = supabaseConfig
  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
  const get = async <T,>(query: string): Promise<T[]> => {
    const response = await fetch(`${url}/rest/v1/${query}`, { headers, signal })
    if (!response.ok) throw new Error(`Content request failed (${response.status})`)
    return (await response.json()) as T[]
  }
  const [items, singletons] = await Promise.all([
    get<ItemRow>('content_items?select=id,collection,data,position,published&published=eq.true&order=position.asc'),
    get<SingletonRow>('content_singletons?select=key,data'),
  ])
  // An empty database means the admin has not imported content yet: keep the bundled content.
  if (items.length === 0 && singletons.length === 0) return null
  return publishedOnly(assembleContent(items, singletons, seed))
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(initialContent)

  useEffect(() => {
    if (!supabaseConfig) return
    const controller = new AbortController()
    fetchPublicContent(controller.signal)
      .then((live) => {
        if (live) setContent(live)
      })
      .catch((error: unknown) => {
        // The bundled content is already on screen; a failed refresh only needs logging.
        if (!controller.signal.aborted) console.warn('Live content unavailable, showing bundled content.', error)
      })
    return () => controller.abort()
  }, [])

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}

export function useContent(): SiteContent {
  return useContext(ContentContext)
}
