import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { SKILL_LEVELS, type SkillLevel } from '@/content/types'
import { useContent } from '@/lib/content'

export function Skills({ index }: { index: string }) {
  const { skillCategories } = useContent()
  const [level, setLevel] = useState<SkillLevel | 'all'>('all')
  if (skillCategories.length === 0) return null

  const usedLevels = SKILL_LEVELS.filter((entry) =>
    skillCategories.some((category) => category.skills.some((skill) => skill.level === entry.value)),
  )

  return (
    <Section
      id="skills"
      index={index}
      eyebrow="Technical skills"
      title="A stack organized by how much I use it, not by how long the list is."
      lead="Each technology is marked by depth of experience. There are no percentages here: they would be invented."
    >
      <div className="skills__legend" role="group" aria-label="Filter skills by experience level">
        <button
          type="button"
          className={`filter${level === 'all' ? ' is-active' : ''}`}
          aria-pressed={level === 'all'}
          onClick={() => setLevel('all')}
        >
          All
        </button>
        {usedLevels.map((entry) => (
          <button
            key={entry.value}
            type="button"
            className={`filter${level === entry.value ? ' is-active' : ''}`}
            aria-pressed={level === entry.value}
            onClick={() => setLevel(entry.value)}
            title={entry.description}
          >
            <span className={`level-dot level-dot--${entry.value}`} aria-hidden="true" />
            {entry.label}
            <span className="filter__hint">{entry.description}</span>
          </button>
        ))}
      </div>

      <div className="skills__grid">
        {skillCategories.map((category, index) => (
          <Reveal key={category.id} className="skill-card" order={index % 3}>
            <h3>{category.name}</h3>
            {category.summary && <p className="skill-card__summary">{category.summary}</p>}
            <ul className="skill-card__list">
              {category.skills.map((skill) => {
                const label = SKILL_LEVELS.find((entry) => entry.value === skill.level)?.label ?? ''
                const dimmed = level !== 'all' && skill.level !== level
                return (
                  <li key={skill.name} className={`skill skill--${skill.level}${dimmed ? ' is-dim' : ''}`}>
                    <span className={`level-dot level-dot--${skill.level}`} aria-hidden="true" />
                    {skill.name}
                    <span className="visually-hidden"> ({label})</span>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
