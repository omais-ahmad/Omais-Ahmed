import { useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { SkillSphere } from '@/components/SkillSphere'
import { Tilt } from '@/components/Tilt'
import { SKILL_LEVELS, type SkillLevel } from '@/content/types'
import { useContent } from '@/lib/content'

export function Skills({ index }: { index: string }) {
  const { skillCategories } = useContent()
  const [level, setLevel] = useState<SkillLevel | 'all'>('all')
  if (skillCategories.length === 0) return null

  // The sphere shows the technologies used most: core first, then applied, without repeats.
  const sphereSkills = [...new Map(
    skillCategories
      .flatMap((category) => category.skills)
      .filter((skill) => (skill.level === 'core' || skill.level === 'applied') && skill.name.length <= 20)
      .sort((a, b) => Number(b.level === 'core') - Number(a.level === 'core'))
      .map((skill) => [skill.name, skill] as const),
  ).values()].slice(0, 30)

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
      {sphereSkills.length > 5 && (
        <Reveal className="skills__stage">
          <div className="skills__stage-copy">
            <p className="card__label">Stack in 3D</p>
            <h3>The technologies I use most, in one view.</h3>
            <p>Drag the sphere to turn it. Highlighted names are my core stack; the full list with experience levels is below.</p>
          </div>
          <SkillSphere skills={sphereSkills} />
        </Reveal>
      )}

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
          <Reveal key={category.id} order={index % 3}>
            <Tilt className="skill-card" max={5}>
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
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
