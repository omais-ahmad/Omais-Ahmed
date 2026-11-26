import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { assetUrl } from '@/lib/config'
import { useContent } from '@/lib/content'

export function About({ index }: { index: string }) {
  const { about, profile, achievements } = useContent()
  const [lead, ...paragraphs] = about.paragraphs

  return (
    <Section id="about" index={index} eyebrow="About" title={about.heading}>
      <div className="about">
        {profile.photo && (
          <Reveal className="about__photo">
            <figure>
              <img
                src={assetUrl(profile.photo)}
                alt={`Portrait of ${profile.name}`}
                width={600}
                height={800}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>{profile.title}</span>
                <span className="about__place">
                  <span className="status-dot" aria-hidden="true" />
                  {profile.location}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        )}

        <Reveal className="about__text" order={1}>
          {lead && <p className="about__lead">{lead}</p>}
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}

          <dl className="about__meta">
            <div>
              <dt>Role</dt>
              <dd>{profile.title}</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>{profile.experienceLabel}</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            {profile.availability && (
              <div>
                <dt>Status</dt>
                <dd>{profile.availability}</dd>
              </div>
            )}
          </dl>
        </Reveal>
      </div>

      {about.principles.length > 0 && (
        <div className="principles">
          <h3 className="subheading">How I work</h3>
          <ol className="principles__list">
            {about.principles.map((principle, index) => (
              <li key={principle.title}>
                <Reveal className="principle" order={index}>
                  <span className="principle__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h4>{principle.title}</h4>
                  <p>{principle.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="achievements">
          <h3 className="subheading">Highlights</h3>
          <ul className="achievements__list">
            {achievements.map((achievement, index) => (
              <li key={achievement.id}>
                <Reveal className="achievement" order={index}>
                  <h4>{achievement.title}</h4>
                  <p>{achievement.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}
