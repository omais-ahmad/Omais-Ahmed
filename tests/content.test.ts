import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { COLLECTIONS, SINGLETONS, validateDiagram, validateFields } from '@/admin/schemas'
import { BLANK_ITEMS } from '@/content/defaults'
import { seed } from '@/content/seed'
import { COLLECTION_KEYS, SINGLETON_KEYS, SKILL_LEVELS, type CollectionItem } from '@/content/types'
import { validateContact } from '@/lib/contact'
import { assembleContent, itemToData, publishedOnly, type ItemRow } from '@/lib/content-mapping'
import { formatPeriod, safeExternalUrl, slugify, whatsappUrl } from '@/lib/format'

const publicFile = (path: string) => fileURLToPath(new URL(`../public/${path}`, import.meta.url))

describe('bundled content', () => {
  it('keeps the three employers as separate entries with the documented dates', () => {
    expect(seed.experience.map((entry) => [entry.company, entry.role, entry.start, entry.end])).toEqual([
      ['CyberSoft Vantage (CSV)', 'Full Stack Developer', '2026-01', ''],
      ['Syslab Technologies Sdn Bhd', 'MERN Stack Developer', '2025-09', '2026-01'],
      ['SoftoSol Pvt Ltd', 'Full Stack Developer', '2023-03', '2025-09'],
    ])
  })

  it('gives every project a unique, URL-safe slug', () => {
    const slugs = seed.projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('features Sukna, MITA and PubQ first', () => {
    expect(seed.projects.filter((project) => project.featured).map((project) => project.name)).toEqual([
      'Sukna Financial Platform',
      'MITA – Malaysian Inbound Tourism Authority',
      'PubQ',
    ])
  })

  it('links every GitHub project to a public repository on the profile, and nothing else to a repository', () => {
    const profile = seed.socialLinks.find((link) => link.icon === 'github')?.url
    expect(profile).toBe('https://github.com/omais-ahmad')
    const github = seed.projects.filter((project) => project.group === 'github')
    expect(github.length).toBeGreaterThan(0)
    for (const project of github) expect(project.repoUrl.startsWith(`${profile}/`), project.name).toBe(true)
    // Employer and client work must not point at source code.
    for (const project of seed.projects.filter((item) => item.group !== 'github')) expect(project.repoUrl, project.name).toBe('')
  })

  it('has valid diagrams', () => {
    expect(validateDiagram(seed.hero.diagram)).toBeNull()
    for (const project of seed.projects) expect(validateDiagram(project.diagram), project.name).toBeNull()
  })

  it('only links expertise to projects that exist', () => {
    const slugs = new Set(seed.projects.map((project) => project.slug))
    for (const area of seed.expertise) for (const slug of area.evidence) expect(slugs.has(slug), `${area.title} -> ${slug}`).toBe(true)
  })

  it('only references files that are actually in public/', () => {
    const paths = [seed.profile.photo, seed.profile.cvUrl, ...seed.projects.flatMap((project) => project.images.map((image) => image.src))]
    for (const path of paths) expect(existsSync(publicFile(path)), path).toBe(true)
  })

  it('only uses safe external links', () => {
    const urls = [...seed.socialLinks.map((link) => link.url), ...seed.projects.flatMap((project) => [project.liveUrl, project.repoUrl]).filter(Boolean)]
    for (const url of urls) expect(safeExternalUrl(url), url).not.toBeNull()
  })

  it('lists .NET as work experience (the current backend stack), and no unverified frameworks', () => {
    const skills = seed.skillCategories.flatMap((category) => category.skills)
    expect(skills.find((skill) => skill.name === '.NET')?.level).toBe('applied')
    expect(skills.find((skill) => skill.name === 'ASP.NET Web API')?.level).toBe('applied')
    const names = skills.map((skill) => skill.name.toLowerCase())
    expect(names.some((name) => name.includes('react native') || name.includes('next.js'))).toBe(false)
    const levels = SKILL_LEVELS.map((level) => level.value)
    for (const skill of skills) expect(levels).toContain(skill.level)
  })

  it('passes its own admin validation, so every seeded record can be saved unchanged', () => {
    for (const config of COLLECTIONS) {
      for (const item of seed[config.key] as CollectionItem[]) {
        expect(validateFields(config.fields, itemToData(item)), `${config.key}: ${config.title(itemToData(item))}`).toEqual({})
      }
    }
    for (const config of SINGLETONS) {
      expect(validateFields(config.fields, seed[config.key] as unknown as Record<string, unknown>), config.key).toEqual({})
    }
  })

  it('has an editor for every collection and singleton', () => {
    expect(COLLECTIONS.map((config) => config.key).sort()).toEqual([...COLLECTION_KEYS].sort())
    // cvUrl is managed by the dedicated CV screen; every other profile field has a form field.
    expect(SINGLETONS.map((config) => config.key).sort()).toEqual([...SINGLETON_KEYS].sort())
    for (const config of COLLECTIONS) {
      const editable = config.fields.map((field) => field.name).sort()
      expect(editable, config.key).toEqual(Object.keys(BLANK_ITEMS[config.key]).sort())
    }
  })
})

describe('database mapping', () => {
  const rows: ItemRow[] = [
    { id: 'b', collection: 'projects', position: 1, published: false, data: { name: 'Second', slug: 'second' } },
    { id: 'a', collection: 'projects', position: 0, published: true, data: { name: 'First', slug: 'first' } },
    { id: 'x', collection: 'unknown', position: 0, published: true, data: {} },
  ]

  it('orders rows, fills missing fields and ignores unknown collections', () => {
    const content = assembleContent(rows, [], seed)
    expect(content.projects.map((project) => project.name)).toEqual(['First', 'Second'])
    expect(content.projects[0]?.images).toEqual([])
    expect(content.projects[0]?.diagram).toBeNull()
    expect(content.experience).toEqual([])
  })

  it('falls back to bundled values for singleton fields that were never saved', () => {
    const content = assembleContent([], [{ key: 'profile', data: { name: 'New Name' } }, { key: 'settings', data: { sections: { skills: false } } }], seed)
    expect(content.profile.name).toBe('New Name')
    expect(content.profile.email).toBe(seed.profile.email)
    expect(content.settings.sections.skills).toBe(false)
    expect(content.settings.sections.about).toBe(true)
  })

  it('removes unpublished items from the public view', () => {
    const content = publishedOnly(assembleContent(rows, [], seed))
    expect(content.projects.map((project) => project.slug)).toEqual(['first'])
  })
})

describe('validation', () => {
  it('rejects diagrams whose links point nowhere', () => {
    const lanes = [{ label: 'A', nodes: [{ id: 'one', label: 'One' }] }]
    expect(validateDiagram({ lanes, links: [{ from: 'one', to: 'missing' }] })).toMatch(/not a node id/)
    expect(validateDiagram({ lanes: [], links: [] })).toMatch(/non-empty/)
    expect(validateDiagram('text')).toMatch(/JSON object/)
    expect(validateDiagram(null)).toBeNull()
  })

  it('validates project fields, including nested groups', () => {
    const fields = COLLECTIONS.find((config) => config.key === 'projects')?.fields ?? []
    const errors = validateFields(fields, {
      ...BLANK_ITEMS.projects,
      name: 'Demo',
      slug: 'Not A Slug',
      category: 'FinTech',
      tagline: 'Short',
      liveUrl: 'javascript:alert(1)',
      challenges: [{ challenge: '', solution: 'x' }],
    })
    expect(errors.slug).toBeTruthy()
    expect(errors.liveUrl).toBeTruthy()
    expect(errors['challenges.0.challenge']).toBeTruthy()
    expect(errors.name).toBeUndefined()
  })

  it('validates the contact form with the same limits as the database', () => {
    const valid = { name: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Long enough message', website: '' }
    expect(validateContact(valid)).toEqual({})
    expect(Object.keys(validateContact({ ...valid, name: ' ', email: 'nope', subject: '', message: 'short' })).sort()).toEqual([
      'email',
      'message',
      'name',
      'subject',
    ])
    expect(validateContact({ ...valid, message: 'x'.repeat(4001) }).message).toBeTruthy()
  })
})

describe('formatting helpers', () => {
  it('formats employment periods', () => {
    expect(formatPeriod('2026-01', '')).toBe('Jan 2026 – Present')
    expect(formatPeriod('2023-03', '2025-09')).toBe('Mar 2023 – Sep 2025')
  })

  it('builds slugs', () => {
    expect(slugify('MITA – Malaysian Inbound Tourism Authority')).toBe('mita-malaysian-inbound-tourism-authority')
  })

  it('refuses unsafe link schemes', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeExternalUrl('data:text/html,x')).toBeNull()
    expect(safeExternalUrl('https://example.com')).toBe('https://example.com')
    expect(safeExternalUrl('mailto:a@b.co')).toBe('mailto:a@b.co')
  })

  it('builds WhatsApp links from international numbers and encodes the message', () => {
    expect(whatsappUrl('+92 339 510 1414')).toBe('https://wa.me/923395101414')
    expect(whatsappUrl('0092-339-5101414', ' Hi & hello? ')).toBe('https://wa.me/923395101414?text=Hi%20%26%20hello%3F')
    expect(whatsappUrl('')).toBeNull()
    expect(whatsappUrl('12345')).toBeNull()
    expect(whatsappUrl(seed.profile.whatsapp)).not.toBeNull()
  })
})
