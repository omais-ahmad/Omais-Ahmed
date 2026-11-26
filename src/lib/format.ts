const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-01" -> "Jan 2026". Anything that is not YYYY-MM is returned unchanged. */
export function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return value
  const month = MONTHS[Number(match[2]) - 1]
  return month ? `${month} ${match[1]}` : value
}

export function formatPeriod(start: string, end: string): string {
  const from = formatMonth(start)
  const to = end ? formatMonth(end) : 'Present'
  return from ? `${from} – ${to}` : to
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Only http(s) and mailto links are ever rendered from content. */
export function safeExternalUrl(value: string): string | null {
  const trimmed = value.trim()
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : null
}
