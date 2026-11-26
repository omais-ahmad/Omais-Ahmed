import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { useContent } from '@/lib/content'

export function ExpertiseSection({ index }: { index: string }) {
  const { expertise, projects } = useContent()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (expertise.length === 0) return null

  const selected = expertise.find((item) => item.id === selectedId) ?? expertise[0]
  if (!selected) return null
  const evidence = selected.evidence
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project) => project !== undefined)

  // Arrow keys move between tabs, as the tabs pattern expects.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = expertise.findIndex((item) => item.id === selected.id)
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const next = expertise[(index + step + expertise.length) % expertise.length]
    if (!next) return
    setSelectedId(next.id)
    document.getElementById(`expertise-tab-${next.id}`)?.focus()
  }

  return (
    <Section
      id="expertise"
      index={index}
      eyebrow="Engineering expertise"
      title="What I can own on an engineering team."
      lead="Each area links to the project where I applied it."
    >
      <Reveal className="expertise">
        <div className="expertise__tabs" role="tablist" aria-label="Areas of expertise" aria-orientation="vertical" onKeyDown={onKeyDown}>
          {expertise.map((item, itemIndex) => {
            const isSelected = item.id === selected.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`expertise-tab-${item.id}`}
                aria-selected={isSelected}
                aria-controls="expertise-panel"
                tabIndex={isSelected ? 0 : -1}
                className={`expertise__tab${isSelected ? ' is-active' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="expertise__tab-index" aria-hidden="true">
                  {String(itemIndex + 1).padStart(2, '0')}
                </span>
                {item.title}
              </button>
            )
          })}
        </div>

        <div
          className="expertise__panel"
          role="tabpanel"
          id="expertise-panel"
          aria-labelledby={`expertise-tab-${selected.id}`}
          tabIndex={0}
        >
          <h3>{selected.title}</h3>
          <p className="expertise__summary">{selected.summary}</p>

          {selected.flow.length > 0 && (
            <ol className="flow" aria-label={`${selected.title} flow`} key={selected.id}>
              {selected.flow.map((step, stepIndex) => (
                <li key={step} style={{ ['--step' as string]: stepIndex }}>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}

          {selected.points.length > 0 && (
            <ul className="bullets bullets--columns">
              {selected.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}

          {evidence.length > 0 && (
            <p className="expertise__evidence">
              <span>Applied in</span>
              {evidence.map((project) => (
                <Link key={project.id} to={`/projects/${project.slug}/`} className="link-pill">
                  {project.name}
                  <Icon name="arrow-up-right" size={14} />
                </Link>
              ))}
            </p>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
