import type { CollectionKey, Collections } from './types'

type ItemOf<K extends CollectionKey> = Collections[K][number]
type Blank<K extends CollectionKey> = Omit<ItemOf<K>, 'id' | 'published'>

/**
 * A complete, empty item for every collection. Rows read from the database are merged
 * onto these so that a record saved before a field existed can never crash a component.
 */
export const BLANK_ITEMS: { [K in CollectionKey]: Blank<K> } = {
  experience: { company: '', role: '', location: '', start: '', end: '', summary: '', highlights: [], stack: [] },
  projects: {
    slug: '',
    name: '',
    category: '',
    group: 'case-study',
    featured: false,
    tagline: '',
    description: '',
    role: '',
    technologies: [],
    responsibilities: [],
    features: [],
    architectureSummary: '',
    diagram: null,
    challenges: [],
    images: [],
    liveUrl: '',
    repoUrl: '',
    seoTitle: '',
    seoDescription: '',
  },
  skillCategories: { name: '', summary: '', skills: [] },
  expertise: { title: '', summary: '', points: [], flow: [], evidence: [] },
  education: { degree: '', institution: '', location: '', start: '', end: '', coursework: [], projects: [] },
  certifications: { name: '', issuer: '', date: '', url: '' },
  achievements: { title: '', body: '' },
  socialLinks: { label: '', url: '', icon: 'link' },
  languages: { name: '', level: '' },
}
