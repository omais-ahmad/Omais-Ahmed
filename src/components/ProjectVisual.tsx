import type { Project } from '@/content/types'
import { assetUrl } from '@/lib/config'
import { ArchitectureDiagram } from './ArchitectureDiagram'

/**
 * The visual for a project card. A real screenshot is used when one exists; otherwise the
 * project's architecture diagram, and failing that an abstract blueprint tile. Nothing here
 * imitates a screenshot of an application that cannot be shown.
 */
export function ProjectVisual({ project }: { project: Project }) {
  const image = project.images[0]
  if (image) {
    return (
      <div className="visual visual--image">
        <img src={assetUrl(image.src)} alt={image.alt} loading="lazy" decoding="async" />
      </div>
    )
  }
  if (project.diagram) {
    return (
      <div className="visual visual--diagram">
        <ArchitectureDiagram diagram={project.diagram} label={`${project.name} architecture overview`} compact />
      </div>
    )
  }
  const initials = project.name
    .split(/[\s–-]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="visual visual--blueprint" aria-hidden="true">
      <span className="visual__initials">{initials}</span>
      <span className="visual__tag">{project.category}</span>
    </div>
  )
}
