import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { useContent } from '@/lib/content'
import { safeExternalUrl } from '@/lib/format'

export function EducationSection({ index }: { index: string }) {
  const { education, certifications, languages } = useContent()
  if (education.length === 0 && certifications.length === 0 && languages.length === 0) return null

  return (
    <Section id="education" index={index} eyebrow="Education" title="Education and languages.">
      <div className="education">
        <div className="education__main">
          {education.map((entry) => (
            <Reveal key={entry.id} className="card">
              <p className="card__meta">
                {entry.start} – {entry.end}
                {entry.location && ` · ${entry.location}`}
              </p>
              <h3>{entry.degree}</h3>
              <p className="card__sub">{entry.institution}</p>
              {entry.coursework.length > 0 && (
                <>
                  <p className="card__label">Relevant coursework</p>
                  <ul className="chips">
                    {entry.coursework.map((course) => (
                      <li key={course}>{course}</li>
                    ))}
                  </ul>
                </>
              )}
              {entry.projects.length > 0 && (
                <>
                  <p className="card__label">Academic projects</p>
                  <ul className="bullets bullets--tight">
                    {entry.projects.map((project) => (
                      <li key={project}>{project}</li>
                    ))}
                  </ul>
                </>
              )}
            </Reveal>
          ))}

          {certifications.map((certification) => {
            const href = safeExternalUrl(certification.url)
            return (
              <Reveal key={certification.id} className="card">
                <p className="card__meta">Certification{certification.date && ` · ${certification.date}`}</p>
                <h3>{certification.name}</h3>
                <p className="card__sub">{certification.issuer}</p>
                {href && (
                  <a className="link-pill" href={href} target="_blank" rel="noopener noreferrer">
                    View credential
                    <Icon name="arrow-up-right" size={14} />
                  </a>
                )}
              </Reveal>
            )
          })}
        </div>

        {languages.length > 0 && (
          <Reveal className="card education__languages" order={1}>
            <p className="card__meta">Languages</p>
            <dl className="languages">
              {languages.map((language) => (
                <div key={language.id}>
                  <dt>{language.name}</dt>
                  <dd>{language.level}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </Section>
  )
}
