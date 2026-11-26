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

/**
 * Link that opens WhatsApp on the given number with a message already typed.
 * Returns null when the number has too few digits to be a real international number.
 */
export function whatsappUrl(number: string, message = ''): string | null {
  const digits = number.replace(/\D/g, '').replace(/^00/, '')
  if (digits.length < 8 || digits.length > 15) return null
  const text = message.trim()
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
