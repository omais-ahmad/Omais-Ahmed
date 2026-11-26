import { BLANK_ITEMS } from '@/content/defaults'
import {
  COLLECTION_KEYS,
  SINGLETON_KEYS,
  type CollectionItem,
  type CollectionKey,
  type SingletonKey,
  type SiteContent,
} from '@/content/types'

/** Row shapes of the two content tables (see supabase/migrations/0001_init.sql). */
export interface ItemRow {
  id: string
  collection: string
  data: Record<string, unknown>
  position: number
  published: boolean
  updated_at?: string
}

export interface SingletonRow {
  key: string
  data: Record<string, unknown>
  updated_at?: string
}

export const isCollectionKey = (value: string): value is CollectionKey =>
  (COLLECTION_KEYS as string[]).includes(value)

export const isSingletonKey = (value: string): value is SingletonKey =>
  (SINGLETON_KEYS as string[]).includes(value)

/** Turns a database row into a typed content item, filling any missing field with its blank value. */
export function rowToItem<T extends CollectionItem>(row: ItemRow): T {
  const blank = isCollectionKey(row.collection) ? BLANK_ITEMS[row.collection] : {}
  return { ...blank, ...row.data, id: row.id, published: row.published } as unknown as T
}

/** Strips the columns that live outside the JSON payload. */
export function itemToData(item: CollectionItem): Record<string, unknown> {
  const { id: _id, published: _published, ...data } = item as CollectionItem & Record<string, unknown>
  return data
}

/**
 * Builds the full content object from database rows. Collections come entirely from the
 * database (an empty collection is a valid state); singletons fall back to `fallback`
 * field by field, so a newly added setting has a value before it is first saved.
 */
export function assembleContent(items: ItemRow[], singletons: SingletonRow[], fallback: SiteContent): SiteContent {
  const content: SiteContent = { ...fallback }
  const collections = content as unknown as Record<CollectionKey, CollectionItem[]>
  for (const key of COLLECTION_KEYS) collections[key] = []

  const sorted = [...items].sort((a, b) => a.position - b.position)
  for (const row of sorted) {
    if (isCollectionKey(row.collection)) collections[row.collection].push(rowToItem(row))
  }

  const singles = content as unknown as Record<SingletonKey, Record<string, unknown>>
  for (const row of singletons) {
    if (isSingletonKey(row.key) && row.data && typeof row.data === 'object') {
      singles[row.key] = { ...(fallback[row.key] as unknown as Record<string, unknown>), ...row.data }
    }
  }
  // settings.sections is nested, so merge it one level deeper.
  content.settings = {
    ...content.settings,
    sections: { ...fallback.settings.sections, ...content.settings.sections },
  }
  return content
}

/** The public view of content: unpublished items removed. */
export function publishedOnly(content: SiteContent): SiteContent {
  const result: SiteContent = { ...content }
  const collections = result as unknown as Record<CollectionKey, CollectionItem[]>
  for (const key of COLLECTION_KEYS) collections[key] = collections[key].filter((item) => item.published)
  return result
}
