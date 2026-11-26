import { Link } from 'react-router'
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram'
import { HeroCanvas } from '@/components/HeroCanvas'
import { Icon } from '@/components/Icon'
import { SocialLinks } from '@/components/SocialLinks'
import { Tilt } from '@/components/Tilt'
import { Typewriter } from '@/components/Typewriter'
import { assetUrl } from '@/lib/config'
import { useContent } from '@/lib/content'

/** "Omais Ahmed" -> "omais-ahmed", for the path-style line above the headline. */
const handle = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function Hero() {
  const { profile, hero, settings, experience } = useContent()
  const [headlineLead = '', ...headlineRest] = hero.headline.split(/(?<=[.!?])\s+/)
  const current = experience.find((entry) => !entry.end)

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__copy">
          <div className="hero__badges">
            {hero.status && (
              <p className="pill pill--live">
                <span className="status-dot" aria-hidden="true" />
                {hero.status}
              </p>
            )}
            <p className="hero__location">
              <Icon name="map-pin" size={14} />
              {profile.location}
            </p>
          </div>

          <p className="hero__path">
            <span aria-hidden="true">~/</span>
            {handle(profile.name)}
            {current && (
              <>
                {' '}
                · {current.role} @ {current.company}
              </>
            )}
          </p>

          <h1 id="hero-title" className="hero__title">
            {headlineLead}
            {headlineRest.length > 0 && <span className="gradient-text"> {headlineRest.join(' ')}</span>}
          </h1>

          <Typewriter phrases={hero.roles} />

          <p className="hero__lead">{hero.subheadline}</p>

          <div className="hero__actions">
            {settings.sections.projects && (
              <Link to={{ pathname: '/', hash: '#projects' }} className="button button--primary">
                View projects
                <Icon name="arrow-down" size={16} />
              </Link>
            )}
            {profile.cvUrl && (
              <a className="button button--ghost" href={assetUrl(profile.cvUrl)} download>
                <Icon name="download" size={16} />
                Download CV
              </a>
            )}
            {settings.sections.contact && (
              <Link to={{ pathname: '/', hash: '#contact' }} className="button button--text">
                Contact me
                <Icon name="arrow-up-right" size={16} />
              </Link>
            )}
          </div>

          <SocialLinks withLabels />
        </div>

        <div className="hero__visual">
          <HeroCanvas />
          <Tilt className="hero__stage" max={8}>
          <div className="id-card">
            <div className="id-card__top">
              {profile.photo && (
                <img
                  className="id-card__photo"
                  src={assetUrl(profile.photo)}
                  alt={`Portrait of ${profile.name}`}
                  width={96}
                  height={96}
                  decoding="async"
                />
              )}
              {hero.status && (
                <span className="pill pill--live pill--small">
                  <span className="status-dot" aria-hidden="true" />
                  available
                </span>
              )}
            </div>
            <p className="id-card__name">{profile.name}</p>
            <p className="id-card__title">{profile.title}</p>
            <ul className="id-card__meta">
              <li>
                <Icon name="map-pin" size={13} />
                {profile.location}
              </li>
              {profile.experienceLabel && <li>{profile.experienceLabel} experience</li>}
            </ul>

            {hero.coreStack.length > 0 && (
              <>
                <p className="id-card__label">Core stack</p>
                <ul className="id-card__stack">
                  {hero.coreStack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            <SocialLinks />
          </div>

          {/* Decorative restatement of the card above, so it is hidden from assistive technology. */}
          <div className="code-card" aria-hidden="true">
            <div className="code-card__bar">
              <span className="panel__dots">
                <i />
                <i />
                <i />
              </span>
              <span>profile.ts</span>
            </div>
            <pre>
              <code>
                <span className="tok-key">const</span> engineer = {'{'}
                {'\n'}  name: <span className="tok-str">'{profile.name}'</span>,{'\n'}  role:{' '}
                <span className="tok-str">'{profile.title}'</span>,{'\n'}  base: <span className="tok-str">'{profile.location}'</span>,
                {'\n'}  experience: <span className="tok-str">'{profile.experienceLabel}'</span>,{'\n'}  focus:{' '}
                <span className="tok-str">'{hero.specializations[0] ?? 'Full-stack engineering'}'</span>,{'\n'}
                {'}'}
              </code>
            </pre>
          </div>
          </Tilt>
        </div>
      </div>

      {hero.specializations.length > 0 && (
        <div className="container">
          <ul className="hero__tags" aria-label="Core specializations">
            {hero.specializations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {hero.facts.length > 0 && (
        <div className="container">
          <dl className="facts">
            {hero.facts.map((fact) => (
              <div className="facts__item" key={fact.label}>
                <dt className="facts__label">{fact.label}</dt>
                <dd className="facts__value">{fact.value}</dd>
                <dd className="facts__detail">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {hero.diagram && (
        <div className="container hero__map">
          <div className="panel">
            <div className="panel__bar">
              <span className="panel__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="panel__title">{hero.diagramTitle}</span>
            </div>
            <ArchitectureDiagram diagram={hero.diagram} label={hero.diagramTitle} animated />
          </div>
        </div>
      )}
    </section>
  )
}
