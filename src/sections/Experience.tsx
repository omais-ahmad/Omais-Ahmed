import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import type { ExperienceEntry } from '@/content/types'
import { useContent } from '@/lib/content'
import { formatPeriod } from '@/lib/format'

const PREVIEW_COUNT = 4

function Entry({ entry, number }: { entry: ExperienceEntry; number: string }) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = entry.highlights.length > PREVIEW_COUNT
  const listId = `experience-${entry.id}`

  return (
    <article className="timeline__entry">
      <div className="timeline__rail">
        <span className="timeline__index" aria-hidden="true">
          [{number}]
        </span>
        <p className="timeline__period">{formatPeriod(entry.start, entry.end)}</p>
        {!entry.end && <span className="badge badge--live">Current</span>}
      </div>
      <div className="timeline__marker" aria-hidden="true">
        <span className={entry.end ? '' : 'is-current'} />
      </div>
      <div className="timeline__card">
        <header className="timeline__head">
          <h3 className="timeline__role">{entry.role}</h3>
          <p className="timeline__company">
            <strong>{entry.company}</strong>
            {entry.location && (
              <span>
                <Icon name="map-pin" size={13} />
                {entry.location}
              </span>
            )}
          </p>
        </header>
        {entry.summary && <p className="timeline__summary">{entry.summary}</p>}
        <ul className="bullets" id={listId}>
          {entry.highlights.map((highlight, index) => (
            <li key={highlight.slice(0, 48)} hidden={!expanded && index >= PREVIEW_COUNT}>
              {highlight}
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            type="button"
            className="text-button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show fewer' : `Show all ${entry.highlights.length} contributions`}
          </button>
        )}
        {entry.stack.length > 0 && (
          <ul className="chips" aria-label="Technologies">
            {entry.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export function Experience({ index }: { index: string }) {
  const { experience } = useContent()
  if (experience.length === 0) return null

  return (
    <Section
      id="experience"
      index={index}
      eyebrow="Experience"
      title="Where I have worked, and what I built there."
    >
      <div className="timeline">
        {experience.map((entry, position) => (
          <Reveal key={entry.id}>
            <Entry entry={entry} number={String(experience.length - position).padStart(2, '0')} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
