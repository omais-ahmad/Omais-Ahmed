import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Canvas for the hero's 3D scene. three.js is fetched only in the browser, after the page
 * has rendered, so it never delays the first paint and is absent from the prerendered HTML.
 * With reduced motion the scene is drawn once and left still.
 */
export function HeroCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const element = canvas.current
    if (!element) return
    let dispose: (() => void) | undefined
    let cancelled = false
    void import('@/three/heroScene').then(({ mountHeroScene }) => {
      if (cancelled) return
      dispose = mountHeroScene(element, { animate: !reducedMotion })
      element.classList.add('is-ready')
    })
    return () => {
      cancelled = true
      dispose?.()
      element.classList.remove('is-ready')
    }
  }, [reducedMotion])

  return <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
}
