import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'

const TYPE_MS = 70
const ERASE_MS = 35
const HOLD_MS = 1600

/**
 * Types each phrase, holds it, erases it and moves to the next one.
 * The first phrase is rendered in full on the server and for visitors who prefer reduced
 * motion, so the line is never empty and never moves for them.
 */
export function Typewriter({ phrases }: { phrases: string[] }) {
  const reducedMotion = usePrefersReducedMotion()
  const first = phrases[0] ?? ''
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(first.length)
  const [erasing, setErasing] = useState(false)

  const animate = !reducedMotion && phrases.length > 1
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? ''

  useEffect(() => {
    if (!animate) return
    let delay = erasing ? ERASE_MS : TYPE_MS
    if (!erasing && length === phrase.length) delay = HOLD_MS
    const timer = window.setTimeout(() => {
      if (!erasing && length === phrase.length) setErasing(true)
      else if (erasing && length === 0) {
        setErasing(false)
        setIndex((value) => (value + 1) % phrases.length)
      } else setLength((value) => value + (erasing ? -1 : 1))
    }, delay)
    return () => window.clearTimeout(timer)
  }, [animate, erasing, length, phrase, phrases.length])

  if (phrases.length === 0) return null

  return (
    <p className="typed">
      <span className="typed__prompt" aria-hidden="true">
        &gt;
      </span>
      {/* Screen readers get the full list once instead of a stream of partial words. */}
      <span className="visually-hidden">{phrases.join(', ')}</span>
      <span aria-hidden="true">{animate ? phrase.slice(0, length) : first}</span>
      <span className={`typed__caret${animate ? ' is-blinking' : ''}`} aria-hidden="true" />
    </p>
  )
}
