import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  )
  return observer
}

interface Props {
  children: ReactNode
  className?: string
  /** Stagger position within a group, in steps of 70ms. */
  order?: number
}

/**
 * Fades content in the first time it scrolls into view. The hidden state only applies when
 * scripting is available (the `js` class on <html>) and motion is allowed, so prerendered
 * pages and reduced-motion users always see the content.
 */
export function Reveal({ children, className = '', order = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const io = getObserver()
    io.observe(element)
    return () => io.unobserve(element)
  }, [])

  const style = order ? ({ '--reveal-delay': `${order * 70}ms` } as CSSProperties) : undefined
  return (
    <div ref={ref} className={`reveal ${className}`.trim()} style={style}>
      {children}
    </div>
  )
}
