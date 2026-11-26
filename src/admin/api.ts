import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { seed } from '@/content/seed'
import {
  COLLECTION_KEYS,
  SINGLETON_KEYS,
  type CollectionItem,
  type CollectionKey,
  type SingletonKey,
  type Singletons,
} from '@/content/types'
import { STORAGE_BUCKET, supabaseConfig } from '@/lib/config'
import { itemToData, type ItemRow, type SingletonRow } from '@/lib/content-mapping'

let client: SupabaseClient | null = null

/** The Supabase client. Only called from the dashboard, after the configuration check. */
export function supabase(): SupabaseClient {
  if (!supabaseConfig) throw new Error('Supabase is not configured')
  client ??= createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
  return client
}

/** Turns a Supabase error into an Error with a message that is safe to show. */
function fail(action: string, error: { message?: string } | null): never {
  throw new Error(`${action} failed${error?.message ? `: ${error.message}` : '.'}`)
}

// ---------- Authorization ----------

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase().rpc('is_admin')
  if (error) fail('Checking permissions', error)
  return data === true
}

// ---------- Collections ----------

export async function listItems(collection: CollectionKey): Promise<ItemRow[]> {
  const { data, error } = await supabase()
    .from('content_items')
    .select('id, collection, data, position, published, updated_at')
    .eq('collection', collection)
    .order('position', { ascending: true })
  if (error) fail('Loading items', error)
  return (data ?? []) as ItemRow[]
}

export async function createItem(
  collection: CollectionKey,
  data: Record<string, unknown>,
  position: number,
  published: boolean,
): Promise<ItemRow> {
  const { data: row, error } = await supabase()
    .from('content_items')
    .insert({ collection, data, position, published })
    .select('id, collection, data, position, published, updated_at')
    .single()
  if (error) fail('Creating the item', error)
  return row as ItemRow
}

export async function updateItem(
  id: string,
  changes: Partial<Pick<ItemRow, 'data' | 'published' | 'position'>>,
): Promise<ItemRow> {
  const { data: row, error } = await supabase()
    .from('content_items')
    .update(changes)
    .eq('id', id)
    .select('id, collection, data, position, published, updated_at')
    .single()
  if (error) fail('Saving the item', error)
  return row as ItemRow
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase().from('content_items').delete().eq('id', id)
  if (error) fail('Deleting the item', error)
}

/** Writes the given order back as positions 0..n-1, touching only rows whose position changed. */
export async function saveOrder(rows: ItemRow[]): Promise<void> {
  const changed = rows.map((row, index) => ({ row, index })).filter(({ row, index }) => row.position !== index)
  const results = await Promise.all(
    changed.map(({ row, index }) => supabase().from('content_items').update({ position: index }).eq('id', row.id)),
  )
  const failed = results.find((result) => result.error)
  if (failed?.error) fail('Saving the order', failed.error)
}

// ---------- Singletons ----------

export async function listSingletons(): Promise<SingletonRow[]> {
  const { data, error } = await supabase().from('content_singletons').select('key, data, updated_at')
  if (error) fail('Loading content', error)
  return (data ?? []) as SingletonRow[]
}

export async function loadSingleton<K extends SingletonKey>(key: K): Promise<Singletons[K]> {
  const { data, error } = await supabase().from('content_singletons').select('data').eq('key', key).maybeSingle()
  if (error) fail('Loading content', error)
  const fallback = seed[key] as unknown as Record<string, unknown>
  return { ...fallback, ...((data?.data as Record<string, unknown> | undefined) ?? {}) } as unknown as Singletons[K]
}

export async function saveSingleton<K extends SingletonKey>(key: K, value: Singletons[K]): Promise<void> {
  const { error } = await supabase()
    .from('content_singletons')
    .upsert({ key, data: value as unknown as Record<string, unknown> }, { onConflict: 'key' })
  if (error) fail('Saving', error)
}

// ---------- Overview ----------

export interface Overview {
  counts: Record<CollectionKey, { total: number; published: number }>
  skills: number
  messages: { total: number; unread: number }
  lastUpdated: string | null
  initialized: boolean
}

export async function loadOverview(): Promise<Overview> {
  const db = supabase()
  const [items, singletons, total, unread] = await Promise.all([
    db.from('content_items').select('collection, published, updated_at, data'),
    db.from('content_singletons').select('key, updated_at'),
    db.from('contact_messages').select('id', { count: 'exact', head: true }),
    db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ])
  const error = items.error ?? singletons.error ?? total.error ?? unread.error
  if (error) fail('Loading the overview', error)

  const counts = Object.fromEntries(COLLECTION_KEYS.map((key) => [key, { total: 0, published: 0 }])) as Overview['counts']
  let skills = 0
  let lastUpdated: string | null = null
  const track = (value?: string) => {
    if (value && (!lastUpdated || value > lastUpdated)) lastUpdated = value
  }

  for (const row of (items.data ?? []) as Pick<ItemRow, 'collection' | 'published' | 'updated_at' | 'data'>[]) {
    const entry = counts[row.collection as CollectionKey]
    if (!entry) continue
    entry.total += 1
    if (row.published) entry.published += 1
    if (row.collection === 'skillCategories' && Array.isArray(row.data.skills)) skills += row.data.skills.length
    track(row.updated_at)
  }
  for (const row of (singletons.data ?? []) as Pick<SingletonRow, 'updated_at'>[]) track(row.updated_at)

  return {
    counts,
    skills,
    messages: { total: total.count ?? 0, unread: unread.count ?? 0 },
    lastUpdated,
    initialized: (items.data?.length ?? 0) > 0 || (singletons.data?.length ?? 0) > 0,
  }
}

/** Copies the bundled content into an empty database. Refuses to run if content already exists. */
export async function importBundledContent(): Promise<void> {
  const db = supabase()
  const existing = await db.from('content_items').select('id', { count: 'exact', head: true })
  if (existing.error) fail('Checking existing content', existing.error)
  if ((existing.count ?? 0) > 0) throw new Error('The database already contains content. Nothing was imported.')

  const rows = COLLECTION_KEYS.flatMap((collection) =>
    (seed[collection] as CollectionItem[]).map((item, position) => ({
      collection,
      data: itemToData(item),
      position,
      published: item.published,
    })),
  )
  const inserted = await db.from('content_items').insert(rows)
  if (inserted.error) fail('Importing items', inserted.error)

  const singles = SINGLETON_KEYS.map((key) => ({ key, data: seed[key] as unknown as Record<string, unknown> }))
  const upserted = await db.from('content_singletons').upsert(singles, { onConflict: 'key' })
  if (upserted.error) fail('Importing settings', upserted.error)
}

// ---------- Contact messages ----------

export type MessageStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: MessageStatus
  created_at: string
}

export async function listMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase()
    .from('contact_messages')
    .select('id, name, email, subject, message, status, created_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) fail('Loading messages', error)
  return (data ?? []) as ContactMessage[]
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<void> {
  const { error } = await supabase().from('contact_messages').update({ status }).eq('id', id)
  if (error) fail('Updating the message', error)
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase().from('contact_messages').delete().eq('id', id)
  if (error) fail('Deleting the message', error)
}

// ---------- Uploads ----------

export const UPLOAD_RULES = {
  image: { types: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'], maxBytes: 5 * 1024 * 1024, label: 'PNG, JPEG, WebP or AVIF up to 5 MB' },
  pdf: { types: ['application/pdf'], maxBytes: 5 * 1024 * 1024, label: 'PDF up to 5 MB' },
} as const

export type UploadKind = keyof typeof UPLOAD_RULES

/** Checked here for a fast, clear message. The storage bucket enforces the same limits itself. */
export function validateUpload(file: File, kind: UploadKind): string | null {
  const rule = UPLOAD_RULES[kind]
  if (!(rule.types as readonly string[]).includes(file.type)) return `Unsupported file type. Allowed: ${rule.label}.`
  if (file.size > rule.maxBytes) return `The file is too large. Allowed: ${rule.label}.`
  if (file.size === 0) return 'The file is empty.'
  return null
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
}

/** Uploads a file under a generated name (the original name never reaches the path) and returns its public URL. */
export async function uploadFile(file: File, kind: UploadKind, folder: string): Promise<string> {
  const problem = validateUpload(file, kind)
  if (problem) throw new Error(problem)
  const path = `${folder}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`
  const bucket = supabase().storage.from(STORAGE_BUCKET)
  const { error } = await bucket.upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) fail('Uploading', error)
  return bucket.getPublicUrl(path).data.publicUrl
}

/** Deletes a previously uploaded file. URLs that do not point into the bucket are ignored. */
export async function removeUploadedFile(url: string): Promise<void> {
  if (!supabaseConfig) return
  const prefix = `${supabaseConfig.url}/storage/v1/object/public/${STORAGE_BUCKET}/`
  if (!url.startsWith(prefix)) return
  const { error } = await supabase().storage.from(STORAGE_BUCKET).remove([decodeURIComponent(url.slice(prefix.length))])
  if (error) fail('Removing the file', error)
}
