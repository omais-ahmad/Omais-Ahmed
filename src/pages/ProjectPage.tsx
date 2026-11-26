import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram'
import { Icon } from '@/components/Icon'
import type { Project } from '@/content/types'
import { absoluteUrl, assetUrl } from '@/lib/config'
import { useContent } from '@/lib/content'
import { safeExternalUrl } from '@/lib/format'
import { useScrollLock } from '@/lib/hooks'
import { Seo } from '@/lib/seo'
import { NotFoundPage } from './NotFoundPage'

function Gallery({ project }: { project: Project }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const images = project.images
  useScrollLock(openIndex !== null)

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null)
      if (event.key === 'ArrowRight') setOpenIndex((index) => (index === null ? index : (index + 1) % images.length))
      if (event.key === 'ArrowLeft') {
        setOpenIndex((index) => (index === null ? index : (index - 1 + images.length) % images.length))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, images.length])

  const current = openIndex === null ? undefined : images[openIndex]

  return (
    <section className="case__block" aria-labelledby="gallery-title">
      <h2 id="gallery-title">Screens</h2>
      <ul className="gallery">
        {images.map((image, index) => (
          <li key={image.src}>
            <button type="button" className="gallery__item" onClick={() => setOpenIndex(index)}>
              <img src={assetUrl(image.src)} alt={image.alt} loading="lazy" decoding="async" />
              <span className="visually-hidden">Enlarge image</span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.alt} onClick={() => setOpenIndex(null)}>
          <button type="button" className="icon-button lightbox__close" aria-label="Close image" autoFocus>
            <Icon name="close" size={20} />
          </button>
          <img src={assetUrl(current.src)} alt={current.alt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </section>
  )
}

export function ProjectPage() {
  const { slug } = useParams()
  const { projects, profile } = useContent()
  const index = projects.findIndex((project) => project.slug === slug)
  const project = projects[index]

  if (!project) return <NotFoundPage />

  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : undefined
  const path = `/projects/${project.slug}/`
  const liveUrl = safeExternalUrl(project.liveUrl)
  const repoUrl = safeExternalUrl(project.repoUrl)
  const description = project.seoDescription || project.tagline

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      headline: project.seoTitle || project.name,
      description,
      url: absoluteUrl(path),
      keywords: project.technologies.join(', '),
      author: { '@type': 'Person', name: profile.name, url: absoluteUrl('/') },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: absoluteUrl('/#projects') },
        { '@type': 'ListItem', position: 3, name: project.name, item: absoluteUrl(path) },
      ],
    },
  ]

  return (
    <article className="case">
      <Seo
        title={`${project.seoTitle || project.name} | ${profile.name}`}
        description={description}
        path={path}
        type="article"
        image={project.images[0]?.src ?? 'og-image.png'}
        keywords={project.technologies}
        jsonLd={jsonLd}
      />

      <header className="case__header">
        <div className="hero__backdrop" aria-hidden="true" />
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link to={{ pathname: '/', hash: '#projects' }}>
              <Icon name="arrow-left" size={15} />
              All projects
            </Link>
          </nav>
          <p className="eyebrow">
            <span className="eyebrow__index">{project.group === 'case-study' ? 'Case study' : 'Project'}</span>
            {project.category}
          </p>
          <h1 className="case__title">{project.name}</h1>
          <p className="case__tagline">{project.tagline}</p>

          <dl className="case__meta">
            {project.role && (
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            {project.technologies.length > 0 && (
              <div>
                <dt>Stack</dt>
                <dd>
                  <ul className="chips">
                    {project.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {(liveUrl || repoUrl) && (
              <div>
                <dt>Links</dt>
                <dd className="case__links">
                  {liveUrl && (
                    <a className="link-pill" href={liveUrl} target="_blank" rel="noopener noreferrer">
                      Live site <Icon name="arrow-up-right" size={14} />
                    </a>
                  )}
                  {repoUrl && (
                    <a className="link-pill" href={repoUrl} target="_blank" rel="noopener noreferrer">
                      Source code <Icon name="arrow-up-right" size={14} />
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="container case__content">
        <section className="case__block" aria-labelledby="overview-title">
          <h2 id="overview-title">Overview</h2>
          <p className="case__lead">{project.description}</p>
        </section>

        {(project.diagram || project.architectureSummary) && (
          <section className="case__block" aria-labelledby="architecture-title">
            <h2 id="architecture-title">Architecture</h2>
            {project.architectureSummary && <p>{project.architectureSummary}</p>}
            {project.diagram && (
              <div className="panel panel--flush">
                <ArchitectureDiagram diagram={project.diagram} label={`${project.name} architecture overview`} animated />
              </div>
            )}
          </section>
        )}

        {project.challenges.length > 0 && (
          <section className="case__block" aria-labelledby="challenges-title">
            <h2 id="challenges-title">Engineering challenges and solutions</h2>
            <ol className="challenges">
              {project.challenges.map((item, itemIndex) => (
                <li key={item.challenge.slice(0, 48)}>
                  <span className="challenges__index" aria-hidden="true">
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>Challenge</h3>
                    <p>{item.challenge}</p>
                  </div>
                  <div>
                    <h3>Solution</h3>
                    <p>{item.solution}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(project.responsibilities.length > 0 || project.features.length > 0) && (
          <div className="case__columns">
            {project.responsibilities.length > 0 && (
              <section className="case__block" aria-labelledby="responsibilities-title">
                <h2 id="responsibilities-title">My responsibilities</h2>
                <ul className="bullets">
                  {project.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {project.features.length > 0 && (
              <section className="case__block" aria-labelledby="features-title">
                <h2 id="features-title">Key features</h2>
                <ul className="bullets">
                  {project.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {project.images.length > 0 && <Gallery project={project} />}

        {next && next.id !== project.id && (
          <nav className="case__next" aria-label="Next project">
            <span>Next project</span>
            <Link to={`/projects/${next.slug}/`}>
              {next.name}
              <Icon name="arrow-right" size={20} />
            </Link>
          </nav>
        )}
      </div>
    </article>
  )
}
