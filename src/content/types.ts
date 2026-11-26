/**
 * Content model for the whole portfolio.
 *
 * The same shapes are used by the bundled seed (src/content/seed.ts), the Supabase
 * tables (data is stored as JSON, see supabase/migrations/0001_init.sql) and the admin
 * editors (src/admin/schemas.ts), so a field only has to be described once per layer.
 */

export type SkillLevel = 'core' | 'applied' | 'familiar' | 'learning'

export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'core', label: 'Core', description: 'Primary professional stack, used daily' },
  { value: 'applied', label: 'Applied', description: 'Used in production projects' },
  { value: 'familiar', label: 'Familiar', description: 'Working knowledge' },
  { value: 'learning', label: 'Learning', description: 'Currently in professional development' },
]

/** Fields shared by every item that lives in a collection. */
export interface CollectionItem {
  id: string
  published: boolean
}

export interface Profile {
  name: string
  title: string
  location: string
  email: string
  phone: string
  showPhone: boolean
  /** WhatsApp number in international format, e.g. "+92 300 0000000". Empty hides the WhatsApp contact options. */
  whatsapp: string
  experienceLabel: string
  availability: string
  photo: string
  cvUrl: string
}

export interface HeroFact {
  value: string
  label: string
  detail: string
}

export interface Hero {
  /** Short availability line shown as a pill, e.g. "Open to new opportunities". Empty hides it. */
  status: string
  /** Job titles cycled by the typed line under the headline. */
  roles: string[]
  /** Technologies listed on the profile card. */
  coreStack: string[]
  eyebrow: string
  headline: string
  subheadline: string
  specializations: string[]
  facts: HeroFact[]
  diagramTitle: string
  diagram: Diagram | null
}

export interface Principle {
  title: string
  body: string
}

export interface About {
  heading: string
  paragraphs: string[]
  principles: Principle[]
}

export interface Seo {
  title: string
  description: string
  keywords: string[]
  ogImage: string
}

export type SectionId =
  | 'about'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'expertise'
  | 'education'
  | 'contact'

export interface Settings {
  sections: Record<SectionId, boolean>
  contactHeading: string
  contactIntro: string
  footerNote: string
}

export interface ExperienceEntry extends CollectionItem {
  company: string
  role: string
  location: string
  /** YYYY-MM */
  start: string
  /** YYYY-MM, or empty when this is the current role */
  end: string
  summary: string
  highlights: string[]
  stack: string[]
}

export interface DiagramNode {
  id: string
  label: string
  detail?: string
  note?: string
}

export interface DiagramLane {
  label: string
  nodes: DiagramNode[]
}

export interface DiagramLink {
  from: string
  to: string
  dashed?: boolean
}

export interface Diagram {
  lanes: DiagramLane[]
  links: DiagramLink[]
  caption?: string
}

export interface ChallengeSolution {
  challenge: string
  solution: string
}

export interface ProjectImage {
  src: string
  alt: string
}

/** `github` marks personal and assessment builds whose source is public. */
export type ProjectGroup = 'case-study' | 'earlier' | 'github'

export interface Project extends CollectionItem {
  slug: string
  name: string
  category: string
  group: ProjectGroup
  featured: boolean
  tagline: string
  description: string
  role: string
  technologies: string[]
  responsibilities: string[]
  features: string[]
  architectureSummary: string
  diagram: Diagram | null
  challenges: ChallengeSolution[]
  images: ProjectImage[]
  liveUrl: string
  repoUrl: string
  seoTitle: string
  seoDescription: string
}

export interface Skill {
  name: string
  level: SkillLevel
}

export interface SkillCategory extends CollectionItem {
  name: string
  summary: string
  skills: Skill[]
}

export interface Expertise extends CollectionItem {
  title: string
  summary: string
  points: string[]
  flow: string[]
  /** Slugs of projects where this was applied. */
  evidence: string[]
}

export interface Education extends CollectionItem {
  degree: string
  institution: string
  location: string
  start: string
  end: string
  coursework: string[]
  /** Academic projects completed during the degree. */
  projects: string[]
}

export interface Certification extends CollectionItem {
  name: string
  issuer: string
  date: string
  url: string
}

export interface Achievement extends CollectionItem {
  title: string
  body: string
}

export type SocialIcon = 'github' | 'linkedin' | 'email' | 'link'

export interface SocialLink extends CollectionItem {
  label: string
  url: string
  icon: SocialIcon
}

export interface Language extends CollectionItem {
  name: string
  level: string
}

export interface Singletons {
  profile: Profile
  hero: Hero
  about: About
  seo: Seo
  settings: Settings
}

export interface Collections {
  experience: ExperienceEntry[]
  projects: Project[]
  skillCategories: SkillCategory[]
  expertise: Expertise[]
  education: Education[]
  certifications: Certification[]
  achievements: Achievement[]
  socialLinks: SocialLink[]
  languages: Language[]
}

export type SingletonKey = keyof Singletons
export type CollectionKey = keyof Collections

export const SINGLETON_KEYS: SingletonKey[] = ['profile', 'hero', 'about', 'seo', 'settings']

export const COLLECTION_KEYS: CollectionKey[] = [
  'experience',
  'projects',
  'skillCategories',
  'expertise',
  'education',
  'certifications',
  'achievements',
  'socialLinks',
  'languages',
]

export interface SiteContent extends Singletons, Collections {}
