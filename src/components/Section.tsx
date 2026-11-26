import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface Props {
  id: string
  index: string
  eyebrow: string
  title: string
  lead?: string
  children: ReactNode
  className?: string
}

/** Standard page section: numbered eyebrow, heading, optional lead paragraph, then content. */
export function Section({ id, index, eyebrow, title, lead, children, className = '' }: Props) {
  return (
    <section id={id} className={`section ${className}`.trim()} aria-labelledby={`${id}-title`}>
      <div className="container">
        <Reveal className="section__head">
          <p className="eyebrow">
            <span className="eyebrow__index">{index}</span>
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="section__title">
            {title}
          </h2>
          {lead && <p className="section__lead">{lead}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
