import type { ComponentType } from 'react'
import type { SectionId } from '@/content/types'
import { useContent } from '@/lib/content'
import { absoluteUrl } from '@/lib/config'
import { safeExternalUrl } from '@/lib/format'
import { Seo } from '@/lib/seo'
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { EducationSection } from '@/sections/EducationSection'
import { Experience } from '@/sections/Experience'
import { ExpertiseSection } from '@/sections/ExpertiseSection'
import { Hero } from '@/sections/Hero'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'

const SECTIONS: { id: SectionId; component: ComponentType<{ index: string }> }[] = [
  { id: 'about', component: About },
  { id: 'experience', component: Experience },
  { id: 'skills', component: Skills },
  { id: 'projects', component: Projects },
  { id: 'expertise', component: ExpertiseSection },
  { id: 'education', component: EducationSection },
  { id: 'contact', component: Contact },
]

export function HomePage() {
  const content = useContent()
  const { profile, seo, settings, socialLinks, skillCategories, education } = content
  const enabled = SECTIONS.filter((section) => settings.sections[section.id])

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: seo.description,
    url: absoluteUrl('/'),
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Islamabad', addressCountry: 'PK' },
    sameAs: socialLinks.map((link) => safeExternalUrl(link.url)).filter((url) => url?.startsWith('http')),
    knowsAbout: skillCategories
      .flatMap((category) => category.skills)
      .filter((skill) => skill.level === 'core')
      .map((skill) => skill.name),
    alumniOf: education.map((entry) => ({ '@type': 'CollegeOrUniversity', name: entry.institution })),
  }
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${profile.name} | ${profile.title}`,
    url: absoluteUrl('/'),
  }

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        image={seo.ogImage}
        path="/"
        type="profile"
        jsonLd={[person, website]}
      />
      <Hero />
      {enabled.map((section, index) => {
        const SectionComponent = section.component
        return <SectionComponent key={section.id} index={String(index + 1).padStart(2, '0')} />
      })}
    </>
  )
}
