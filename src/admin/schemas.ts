import { SKILL_LEVELS, type CollectionKey, type SingletonKey } from '@/content/types'
import type { UploadKind } from './api'

/**
 * Editor definitions. Every admin form is generated from these descriptions, so adding a
 * field to the content model means adding one entry here rather than writing a new form.
 */

interface BaseField {
  name: string
  label: string
  help?: string
  required?: boolean
}

export interface TextField extends BaseField {
  type: 'text' | 'textarea' | 'url' | 'email' | 'slug' | 'month'
  maxLength?: number
  rows?: number
  placeholder?: string
}

export interface BooleanField extends BaseField {
  type: 'boolean'
}

export interface SelectField extends BaseField {
  type: 'select'
  options: { value: string; label: string }[]
}

/** A list of short strings, edited one per line. */
export interface ListField extends BaseField {
  type: 'list'
  rows?: number
}

export interface UploadField extends BaseField {
  type: 'upload'
  kind: UploadKind
  folder: string
}

/** A repeatable group of sub-fields (an array of objects). */
export interface GroupField extends BaseField {
  type: 'group'
  fields: Field[]
  itemLabel: string
  blank: Record<string, unknown>
}

/** Structured data edited as JSON, checked by `validate` before it can be saved. */
export interface JsonField extends BaseField {
  type: 'json'
  validate: (value: unknown) => string | null
}

/** A set of on/off switches stored as an object of booleans. */
export interface TogglesField extends BaseField {
  type: 'toggles'
  options: { value: string; label: string }[]
}

export type Field =
  | TextField
  | BooleanField
  | SelectField
  | ListField
  | UploadField
  | GroupField
  | JsonField
  | TogglesField

export interface CollectionConfig {
  key: CollectionKey
  label: string
  singular: string
  description: string
  fields: Field[]
  title: (data: Record<string, unknown>) => string
  subtitle?: (data: Record<string, unknown>) => string
}

export interface SingletonConfig {
  key: SingletonKey
  label: string
  description: string
  fields: Field[]
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/** Structural check for an architecture diagram, including that every link points at a real node. */
export function validateDiagram(value: unknown): string | null {
  if (value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) return 'Must be a JSON object, or null for no diagram.'
  const diagram = value as { lanes?: unknown; links?: unknown }
  if (!Array.isArray(diagram.lanes) || diagram.lanes.length === 0) return '"lanes" must be a non-empty array.'
  const ids = new Set<string>()
  for (const lane of diagram.lanes as { label?: unknown; nodes?: unknown }[]) {
    if (typeof lane?.label !== 'string' || !lane.label) return 'Every lane needs a "label".'
    if (!Array.isArray(lane.nodes) || lane.nodes.length === 0) return `Lane "${lane.label}" needs at least one node.`
    for (const node of lane.nodes as { id?: unknown; label?: unknown }[]) {
      if (typeof node?.id !== 'string' || !node.id) return `A node in "${lane.label}" is missing its "id".`
      if (typeof node.label !== 'string' || !node.label) return `Node "${node.id}" is missing its "label".`
      if (ids.has(node.id)) return `Node id "${node.id}" is used more than once.`
      ids.add(node.id)
    }
  }
  if (!Array.isArray(diagram.links)) return '"links" must be an array.'
  for (const link of diagram.links as { from?: unknown; to?: unknown }[]) {
    if (typeof link?.from !== 'string' || !ids.has(link.from)) return `Link source "${String(link?.from)}" is not a node id.`
    if (typeof link.to !== 'string' || !ids.has(link.to)) return `Link target "${String(link.to)}" is not a node id.`
  }
  return null
}

const DIAGRAM_HELP =
  'JSON: { "caption": "...", "lanes": [{ "label": "...", "nodes": [{ "id": "api", "label": "REST API", "detail": "...", "note": "..." }] }], "links": [{ "from": "api", "to": "db", "dashed": false }] }. Use null for no diagram.'

export const COLLECTIONS: CollectionConfig[] = [
  {
    key: 'experience',
    label: 'Experience',
    singular: 'role',
    description: 'Employment history shown in the timeline, newest first.',
    title: (data) => text(data.role) || 'Untitled role',
    subtitle: (data) => [text(data.company), text(data.start), text(data.end) || 'Present'].filter(Boolean).join(' · '),
    fields: [
      { type: 'text', name: 'role', label: 'Job title', required: true, maxLength: 120 },
      { type: 'text', name: 'company', label: 'Company', required: true, maxLength: 120 },
      { type: 'text', name: 'location', label: 'Location', maxLength: 120 },
      { type: 'month', name: 'start', label: 'Start', required: true, placeholder: '2026-01', help: 'Format: YYYY-MM' },
      { type: 'month', name: 'end', label: 'End', placeholder: '2026-06', help: 'Format: YYYY-MM. Leave empty for the current role.' },
      { type: 'textarea', name: 'summary', label: 'Summary', rows: 2, maxLength: 400 },
      { type: 'list', name: 'highlights', label: 'Contributions', help: 'One per line. The first four are shown before "Show all".', rows: 8 },
      { type: 'list', name: 'stack', label: 'Technologies', help: 'One per line.', rows: 4 },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    singular: 'project',
    description: 'Case studies, earlier work and public GitHub projects. Each published project gets its own page.',
    title: (data) => text(data.name) || 'Untitled project',
    subtitle: (data) =>
      [text(data.category), data.featured ? 'Featured' : '', data.group === 'earlier' ? 'Earlier work' : data.group === 'github' ? 'Code on GitHub' : 'Case study']
        .filter(Boolean)
        .join(' · '),
    fields: [
      { type: 'text', name: 'name', label: 'Project name', required: true, maxLength: 120 },
      { type: 'slug', name: 'slug', label: 'URL slug', required: true, maxLength: 80, help: 'Lowercase letters, numbers and hyphens. Used in /projects/<slug>/.' },
      { type: 'text', name: 'category', label: 'Category', required: true, maxLength: 40, help: 'Used for the filter buttons, e.g. FinTech.' },
      {
        type: 'select',
        name: 'group',
        label: 'Group',
        options: [
          { value: 'case-study', label: 'Case study' },
          { value: 'earlier', label: 'Earlier and freelance work' },
          { value: 'github', label: 'Code on GitHub (public repository)' },
        ],
      },
      { type: 'boolean', name: 'featured', label: 'Featured', help: 'Featured projects get the large card at the top.' },
      { type: 'textarea', name: 'tagline', label: 'Short description', required: true, rows: 2, maxLength: 240 },
      { type: 'textarea', name: 'description', label: 'Detailed description', rows: 5, maxLength: 2000 },
      { type: 'text', name: 'role', label: 'Role', maxLength: 160 },
      { type: 'list', name: 'technologies', label: 'Technologies', help: 'One per line.', rows: 5 },
      { type: 'list', name: 'responsibilities', label: 'Responsibilities', help: 'One per line.', rows: 6 },
      { type: 'list', name: 'features', label: 'Key features', help: 'One per line. The first three appear on the featured card.', rows: 6 },
      { type: 'textarea', name: 'architectureSummary', label: 'Architecture overview', rows: 4, maxLength: 1500 },
      { type: 'json', name: 'diagram', label: 'Architecture diagram', help: DIAGRAM_HELP, validate: validateDiagram },
      {
        type: 'group',
        name: 'challenges',
        label: 'Engineering challenges and solutions',
        itemLabel: 'Challenge',
        blank: { challenge: '', solution: '' },
        fields: [
          { type: 'textarea', name: 'challenge', label: 'Challenge', required: true, rows: 2, maxLength: 600 },
          { type: 'textarea', name: 'solution', label: 'Solution', required: true, rows: 2, maxLength: 600 },
        ],
      },
      {
        type: 'group',
        name: 'images',
        label: 'Screenshots and gallery',
        itemLabel: 'Image',
        help: 'Only real screenshots that are cleared for public display. The first image is used on the card.',
        blank: { src: '', alt: '' },
        fields: [
          { type: 'upload', name: 'src', label: 'Image', kind: 'image', folder: 'projects', required: true },
          { type: 'text', name: 'alt', label: 'Description (alt text)', required: true, maxLength: 160 },
        ],
      },
      { type: 'url', name: 'liveUrl', label: 'Live URL', help: 'Only if the project is publicly available.' },
      { type: 'url', name: 'repoUrl', label: 'Source code URL', help: 'Only if the repository is public.' },
      { type: 'text', name: 'seoTitle', label: 'SEO title', maxLength: 90 },
      { type: 'textarea', name: 'seoDescription', label: 'SEO description', rows: 2, maxLength: 200 },
    ],
  },
  {
    key: 'skillCategories',
    label: 'Skills',
    singular: 'skill category',
    description: 'Skill categories and the skills inside them, each with an honest experience level.',
    title: (data) => text(data.name) || 'Untitled category',
    subtitle: (data) => `${Array.isArray(data.skills) ? data.skills.length : 0} skills`,
    fields: [
      { type: 'text', name: 'name', label: 'Category name', required: true, maxLength: 80 },
      { type: 'text', name: 'summary', label: 'Summary', maxLength: 160 },
      {
        type: 'group',
        name: 'skills',
        label: 'Skills',
        itemLabel: 'Skill',
        blank: { name: '', level: 'applied' },
        fields: [
          { type: 'text', name: 'name', label: 'Skill', required: true, maxLength: 60 },
          {
            type: 'select',
            name: 'level',
            label: 'Level',
            options: SKILL_LEVELS.map((level) => ({ value: level.value, label: `${level.label}: ${level.description}` })),
          },
        ],
      },
    ],
  },
  {
    key: 'expertise',
    label: 'Expertise',
    singular: 'expertise area',
    description: 'The areas in the "Engineering expertise" section.',
    title: (data) => text(data.title) || 'Untitled area',
    fields: [
      { type: 'text', name: 'title', label: 'Title', required: true, maxLength: 80 },
      { type: 'textarea', name: 'summary', label: 'Summary', required: true, rows: 2, maxLength: 300 },
      { type: 'list', name: 'flow', label: 'Flow steps', help: 'One per line, shown as a connected pipeline.', rows: 5 },
      { type: 'list', name: 'points', label: 'Points', help: 'One per line.', rows: 5 },
      { type: 'list', name: 'evidence', label: 'Applied in (project slugs)', help: 'One project slug per line.', rows: 3 },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    singular: 'qualification',
    description: 'Academic qualifications.',
    title: (data) => text(data.degree) || 'Untitled qualification',
    subtitle: (data) => text(data.institution),
    fields: [
      { type: 'text', name: 'degree', label: 'Degree', required: true, maxLength: 160 },
      { type: 'text', name: 'institution', label: 'Institution', required: true, maxLength: 200 },
      { type: 'text', name: 'location', label: 'Location', maxLength: 120 },
      { type: 'text', name: 'start', label: 'Start year', maxLength: 10 },
      { type: 'text', name: 'end', label: 'End year', maxLength: 10 },
      { type: 'list', name: 'coursework', label: 'Relevant coursework', help: 'One per line.', rows: 6 },
      { type: 'list', name: 'projects', label: 'Academic projects', help: 'One per line.', rows: 4 },
    ],
  },
  {
    key: 'certifications',
    label: 'Certifications',
    singular: 'certification',
    description: 'Only certifications you actually hold. They appear in the Education section.',
    title: (data) => text(data.name) || 'Untitled certification',
    subtitle: (data) => [text(data.issuer), text(data.date)].filter(Boolean).join(' · '),
    fields: [
      { type: 'text', name: 'name', label: 'Certification', required: true, maxLength: 160 },
      { type: 'text', name: 'issuer', label: 'Issuer', required: true, maxLength: 160 },
      { type: 'text', name: 'date', label: 'Date', maxLength: 40, placeholder: 'March 2026' },
      { type: 'url', name: 'url', label: 'Credential URL' },
    ],
  },
  {
    key: 'achievements',
    label: 'Highlights',
    singular: 'highlight',
    description: 'Professional achievements shown under About.',
    title: (data) => text(data.title) || 'Untitled highlight',
    fields: [
      { type: 'text', name: 'title', label: 'Title', required: true, maxLength: 80 },
      { type: 'textarea', name: 'body', label: 'Description', required: true, rows: 3, maxLength: 400 },
    ],
  },
  {
    key: 'socialLinks',
    label: 'Social links',
    singular: 'link',
    description: 'Links shown in the hero, contact section and footer.',
    title: (data) => text(data.label) || 'Untitled link',
    subtitle: (data) => text(data.url),
    fields: [
      { type: 'text', name: 'label', label: 'Label', required: true, maxLength: 40 },
      { type: 'url', name: 'url', label: 'URL', required: true, help: 'https://… or mailto:…' },
      {
        type: 'select',
        name: 'icon',
        label: 'Icon',
        options: [
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'github', label: 'GitHub' },
          { value: 'email', label: 'Email' },
          { value: 'link', label: 'Generic link' },
        ],
      },
    ],
  },
  {
    key: 'languages',
    label: 'Languages',
    singular: 'language',
    description: 'Spoken languages.',
    title: (data) => text(data.name) || 'Untitled language',
    subtitle: (data) => text(data.level),
    fields: [
      { type: 'text', name: 'name', label: 'Language', required: true, maxLength: 60 },
      { type: 'text', name: 'level', label: 'Proficiency', required: true, maxLength: 80 },
    ],
  },
]

export const SINGLETONS: SingletonConfig[] = [
  {
    key: 'profile',
    label: 'Profile',
    description: 'Name, title and contact details used across the site.',
    fields: [
      { type: 'text', name: 'name', label: 'Name', required: true, maxLength: 80 },
      { type: 'text', name: 'title', label: 'Professional title', required: true, maxLength: 80 },
      { type: 'text', name: 'location', label: 'Location', required: true, maxLength: 80 },
      { type: 'email', name: 'email', label: 'Email', required: true },
      { type: 'text', name: 'phone', label: 'Phone', maxLength: 30 },
      { type: 'boolean', name: 'showPhone', label: 'Show phone number publicly' },
      { type: 'text', name: 'whatsapp', label: 'WhatsApp number', maxLength: 30, placeholder: '+92 300 0000000', help: 'International format with the country code. Leave empty to remove the WhatsApp button.' },
      { type: 'text', name: 'experienceLabel', label: 'Experience', maxLength: 30, placeholder: '3+ years' },
      { type: 'text', name: 'availability', label: 'Status line', maxLength: 120 },
      { type: 'upload', name: 'photo', label: 'Profile photo', kind: 'image', folder: 'profile' },
    ],
  },
  {
    key: 'hero',
    label: 'Hero',
    description: 'The first screen of the home page.',
    fields: [
      { type: 'text', name: 'headline', label: 'Headline', required: true, maxLength: 120, help: 'A second sentence is shown in the accent gradient.' },
      { type: 'text', name: 'status', label: 'Availability pill', maxLength: 60, help: 'Shown at the top of the page and in the header. Leave empty to hide it.' },
      { type: 'list', name: 'roles', label: 'Typed roles', help: 'One per line. Typed one after another under the headline.', rows: 4 },
      { type: 'list', name: 'coreStack', label: 'Core stack', help: 'One per line. Shown on the profile card.', rows: 4 },
      { type: 'text', name: 'eyebrow', label: 'Search and social title line', maxLength: 80 },
      { type: 'textarea', name: 'subheadline', label: 'Supporting text', required: true, rows: 3, maxLength: 320 },
      { type: 'list', name: 'specializations', label: 'Core specializations', help: 'One per line.', rows: 4 },
      {
        type: 'group',
        name: 'facts',
        label: 'Facts strip',
        itemLabel: 'Fact',
        help: 'Only verifiable facts. No invented metrics.',
        blank: { value: '', label: '', detail: '' },
        fields: [
          { type: 'text', name: 'value', label: 'Value', required: true, maxLength: 8 },
          { type: 'text', name: 'label', label: 'Label', required: true, maxLength: 60 },
          { type: 'text', name: 'detail', label: 'Detail', maxLength: 120 },
        ],
      },
      { type: 'text', name: 'diagramTitle', label: 'Diagram title', maxLength: 80 },
      { type: 'json', name: 'diagram', label: 'System map diagram', help: DIAGRAM_HELP, validate: validateDiagram },
    ],
  },
  {
    key: 'about',
    label: 'About',
    description: 'The introduction and working principles.',
    fields: [
      { type: 'text', name: 'heading', label: 'Heading', required: true, maxLength: 140 },
      { type: 'list', name: 'paragraphs', label: 'Paragraphs', help: 'One paragraph per line.', rows: 12 },
      {
        type: 'group',
        name: 'principles',
        label: 'How I work',
        itemLabel: 'Principle',
        blank: { title: '', body: '' },
        fields: [
          { type: 'text', name: 'title', label: 'Title', required: true, maxLength: 60 },
          { type: 'textarea', name: 'body', label: 'Description', required: true, rows: 2, maxLength: 240 },
        ],
      },
    ],
  },
  {
    key: 'seo',
    label: 'SEO',
    description: 'Search and social sharing metadata for the home page.',
    fields: [
      { type: 'text', name: 'title', label: 'Page title', required: true, maxLength: 90, help: 'About 60 characters displays fully in search results.' },
      { type: 'textarea', name: 'description', label: 'Meta description', required: true, rows: 3, maxLength: 220, help: 'About 155 characters.' },
      { type: 'list', name: 'keywords', label: 'Keywords', help: 'One per line.', rows: 8 },
      { type: 'upload', name: 'ogImage', label: 'Social sharing image', kind: 'image', folder: 'seo', help: '1200 × 630 pixels.' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'Section visibility and site-wide text.',
    fields: [
      {
        type: 'toggles',
        name: 'sections',
        label: 'Visible sections',
        options: [
          { value: 'about', label: 'About' },
          { value: 'experience', label: 'Experience' },
          { value: 'skills', label: 'Technical skills' },
          { value: 'projects', label: 'Projects' },
          { value: 'expertise', label: 'Engineering expertise' },
          { value: 'education', label: 'Education' },
          { value: 'contact', label: 'Contact' },
        ],
      },
      { type: 'text', name: 'contactHeading', label: 'Contact heading', required: true, maxLength: 120 },
      { type: 'textarea', name: 'contactIntro', label: 'Contact introduction', rows: 3, maxLength: 400 },
      { type: 'text', name: 'footerNote', label: 'Footer note', maxLength: 160 },
    ],
  },
]

// ---------- Validation ----------

export type FieldErrors = Record<string, string>

const URL_PATTERN = /^(https?:\/\/|mailto:)\S+$/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

/** Validates a form value against its field definitions. Keys are dotted paths, e.g. "skills.2.name". */
export function validateFields(fields: Field[], value: Record<string, unknown>, prefix = ''): FieldErrors {
  const errors: FieldErrors = {}
  for (const field of fields) {
    const path = prefix + field.name
    const current = value[field.name]

    if (field.type === 'group') {
      const items = Array.isArray(current) ? (current as Record<string, unknown>[]) : []
      items.forEach((item, index) => Object.assign(errors, validateFields(field.fields, item ?? {}, `${path}.${index}.`)))
      continue
    }
    if (field.type === 'json') {
      const problem = field.validate(current ?? null)
      if (problem) errors[path] = problem
      continue
    }
    if (field.type === 'list') {
      if (field.required && (!Array.isArray(current) || current.length === 0)) errors[path] = 'Add at least one entry.'
      continue
    }
    if (field.type === 'boolean' || field.type === 'toggles' || field.type === 'select') continue

    const string = typeof current === 'string' ? current.trim() : ''
    if (!string) {
      if (field.required) errors[path] = `${field.label} is required.`
      continue
    }
    if (field.type === 'upload') continue
    if (field.maxLength && string.length > field.maxLength) {
      errors[path] = `Must be ${field.maxLength} characters or fewer.`
    } else if (field.type === 'url' && !URL_PATTERN.test(string)) {
      errors[path] = 'Enter a full URL starting with https:// (or mailto:).'
    } else if (field.type === 'email' && !EMAIL_PATTERN.test(string)) {
      errors[path] = 'Enter a valid email address.'
    } else if (field.type === 'slug' && !SLUG_PATTERN.test(string)) {
      errors[path] = 'Use lowercase letters, numbers and single hyphens only.'
    } else if (field.type === 'month' && !MONTH_PATTERN.test(string)) {
      errors[path] = 'Use the format YYYY-MM.'
    }
  }
  return errors
}
