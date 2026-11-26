import { createContext, useContext, useEffect } from 'react'
import { absoluteUrl, assetUrl, SITE_ORIGIN } from './config'

export interface SeoProps {
  title: string
  description: string
  /** Route path, e.g. "/" or "/projects/slug/". */
  path: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  keywords?: string[]
  noindex?: boolean
  jsonLd?: Record<string, unknown>[]
}

interface HeadTag {
  tag: 'title' | 'meta' | 'link' | 'script'
  attrs: Record<string, string>
  text?: string
}

/** During prerendering the active page writes its tags here instead of touching a DOM. */
export interface HeadCollector {
  tags: HeadTag[]
}

export const HeadContext = createContext<HeadCollector | null>(null)

function buildTags(props: SeoProps): HeadTag[] {
  const url = absoluteUrl(props.path)
  const image = props.image ? toAbsolute(assetUrl(props.image)) : ''
  const tags: HeadTag[] = [
    { tag: 'title', attrs: {}, text: props.title },
    { tag: 'meta', attrs: { name: 'description', content: props.description } },
    { tag: 'meta', attrs: { name: 'robots', content: props.noindex ? 'noindex, nofollow' : 'index, follow' } },
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    { tag: 'meta', attrs: { property: 'og:type', content: props.type ?? 'website' } },
    { tag: 'meta', attrs: { property: 'og:title', content: props.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: props.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: props.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: props.description } },
  ]
  if (props.keywords?.length) {
    tags.push({ tag: 'meta', attrs: { name: 'keywords', content: props.keywords.join(', ') } })
  }
  if (image) {
    tags.push({ tag: 'meta', attrs: { property: 'og:image', content: image } })
    tags.push({ tag: 'meta', attrs: { name: 'twitter:image', content: image } })
  }
  for (const data of props.jsonLd ?? []) {
    // "<" is escaped so that content can never close the script element.
    tags.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      text: JSON.stringify(data).replace(/</g, '\\u003c'),
    })
  }
  return tags
}

function toAbsolute(url: string): string {
  return /^https?:\/\//i.test(url) ? url : SITE_ORIGIN + url
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Serializes collected tags for the prerendered document head. */
export function renderHeadTags(tags: HeadTag[]): string {
  return tags
    .map(({ tag, attrs, text }) => {
      const attributes = Object.entries({ ...attrs, 'data-seo': '' })
        .map(([key, value]) => (value === '' ? key : `${key}="${escapeHtml(value)}"`))
        .join(' ')
      if (tag === 'title') return `<title data-seo>${escapeHtml(text ?? '')}</title>`
      if (tag === 'script') return `<script ${attributes}>${text ?? ''}</script>`
      return `<${tag} ${attributes}>`
    })
    .join('\n    ')
}

function applyTags(tags: HeadTag[]): void {
  document.head.querySelectorAll('[data-seo]').forEach((node) => node.remove())
  for (const { tag, attrs, text } of tags) {
    const element = document.createElement(tag)
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value)
    element.setAttribute('data-seo', '')
    if (text !== undefined) element.textContent = text
    document.head.appendChild(element)
  }
}

/** Declares the document head for the current page. Renders nothing. */
export function Seo(props: SeoProps) {
  const collector = useContext(HeadContext)
  const tags = buildTags(props)
  if (collector) collector.tags = tags

  const signature = JSON.stringify(tags)
  useEffect(() => {
    applyTags(JSON.parse(signature) as HeadTag[])
  }, [signature])

  return null
}
