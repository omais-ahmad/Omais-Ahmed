/** Runtime configuration. Everything here is public by design (it ships in the bundle). */

const env = import.meta.env

/** Base path the site is served from, always with a trailing slash ("/" at a domain root). */
export const BASE_PATH: string = env.BASE_URL

/** Public origin without a trailing slash. */
export const SITE_ORIGIN: string = (env.VITE_SITE_URL || 'https://omais-ahmed.netlify.app').replace(/\/+$/, '')

/** Resolves a content path ("img/x.webp") against the base path. Absolute URLs pass through. */
export function assetUrl(path: string): string {
  if (!path) return ''
  if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(path)) return path
  return BASE_PATH + path
}

/** Absolute, canonical URL for a route path such as "/" or "/projects/slug/". */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return SITE_ORIGIN + BASE_PATH + path.replace(/^\/+/, '')
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}

const supabaseUrl = (env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || ''

/** null when the backend has not been configured: the site then runs from bundled content. */
export const supabaseConfig: SupabaseConfig | null =
  supabaseUrl && supabaseAnonKey ? { url: supabaseUrl, anonKey: supabaseAnonKey } : null

/**
 * EmailJS identifiers, read from the environment so that no account identifier lives in the
 * repository. When they are missing the email notification is skipped (see lib/contact.ts).
 */
export const emailJsConfig = {
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY || '',
  serviceId: env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: env.VITE_EMAILJS_TEMPLATE_ID || '',
}

export const STORAGE_BUCKET = 'media'
