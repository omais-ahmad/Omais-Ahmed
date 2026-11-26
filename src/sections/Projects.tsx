import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Icon } from '@/components/Icon'
import { ProjectVisual } from '@/components/ProjectVisual'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import type { Project } from '@/content/types'
import { useContent } from '@/lib/content'

function ProjectCard({ project, variant }: { project: Project; variant: 'featured' | 'standard' | 'compact' }) {
  const titleId = `project-${project.id}`
  return (
    <article className={`project-card project-card--${variant}`} aria-labelledby={titleId}>
      <div className="project-card__visual">
        <ProjectVisual project={project} />
      </div>
      <div className="project-card__body">
        <p className="project-card__category">{project.category}</p>
        <h3 id={titleId} className="project-card__title">
          <Link to={`/projects/${project.slug}/`} className="project-card__link">
            {project.name}
          </Link>
        </h3>
        <p className="project-card__tagline">{project.tagline}</p>
        {variant === 'featured' && project.features.length > 0 && (
          <ul className="bullets bullets--tight">
            {project.features.slice(0, 3).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}
        {project.technologies.length > 0 && (
          <ul className="chips" aria-label="Technologies">
            {project.technologies.slice(0, variant === 'compact' ? 4 : 8).map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        )}
        <span className="project-card__cta" aria-hidden="true">
          {project.group === 'case-study' ? 'Read the case study' : project.group === 'github' ? 'View project and source' : 'View project'}
          <Icon name="arrow-right" size={15} />
        </span>
      </div>
    </article>
  )
}

export function Projects({ index }: { index: string }) {
  const { projects } = useContent()
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => ['All', ...new Set(projects.map((project) => project.category).filter(Boolean))], [projects])
  if (projects.length === 0) return null

  const visible = category === 'All' ? projects : projects.filter((project) => project.category === category)
  const featured = visible.filter((project) => project.featured)
  const standard = visible.filter((project) => !project.featured && project.group === 'case-study')
  const earlier = visible.filter((project) => !project.featured && project.group === 'earlier')
  const github = visible.filter((project) => !project.featured && project.group === 'github')

  return (
    <Section
      id="projects"
      index={index}
      eyebrow="Projects"
      title="Systems I have built, and the engineering behind them."
      lead="Enterprise work is shown through its architecture rather than screenshots, because the applications themselves are private."
    >
      {categories.length > 2 && (
        <div className="filters" role="group" aria-label="Filter projects by domain">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className={`filter${category === name ? ' is-active' : ''}`}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <p className="visually-hidden" role="status">
        Showing {visible.length} of {projects.length} projects
      </p>

      {featured.length > 0 && (
        <div className="projects__featured">
          {featured.map((project) => (
            <Reveal key={project.id}>
              <ProjectCard project={project} variant="featured" />
            </Reveal>
          ))}
        </div>
      )}

      {standard.length > 0 && (
        <div className="projects__grid">
          {standard.map((project, index) => (
            <Reveal key={project.id} order={index % 3}>
              <ProjectCard project={project} variant="standard" />
            </Reveal>
          ))}
        </div>
      )}

      {earlier.length > 0 && (
        <>
          <h3 className="subheading">Earlier and freelance work</h3>
          <div className="projects__grid projects__grid--compact">
            {earlier.map((project, index) => (
              <Reveal key={project.id} order={index % 4}>
                <ProjectCard project={project} variant="compact" />
              </Reveal>
            ))}
          </div>
        </>
      )}

      {github.length > 0 && (
        <>
          <h3 className="subheading">Code on GitHub</h3>
          <p className="projects__note">
            Take-home exercises and personal builds. The source is public, so the code can be read as well as described.
          </p>
          <div className="projects__grid projects__grid--compact">
            {github.map((project, index) => (
              <Reveal key={project.id} order={index % 4}>
                <ProjectCard project={project} variant="compact" />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </Section>
  )
}
