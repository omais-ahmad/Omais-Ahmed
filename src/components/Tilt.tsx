import { useRef, type PointerEvent, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'

interface Props {
  children: ReactNode
  className?: string
  /** Largest rotation in degrees, reached at the edges. */
  max?: number
}

/**
 * Tilts its content towards the mouse in 3D and moves a soft highlight under the cursor.
 * Values are written straight to CSS variables, so moving the mouse causes no renders.
 * Touch input and reduced-motion visitors get the flat card.
 */
export function Tilt({ children, className = '', max = 6 }: Props) {
  const element = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = element.current
    if (!node || reducedMotion || event.pointerType !== 'mouse') return
    const box = node.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    node.style.setProperty('--tilt-x', `${((0.5 - y) * max * 2).toFixed(2)}deg`)
    node.style.setProperty('--tilt-y', `${((x - 0.5) * max * 2).toFixed(2)}deg`)
    node.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`)
    node.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`)
    node.classList.add('is-tilting')
  }

  const onPointerLeave = () => {
    const node = element.current
    if (!node) return
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')
    node.classList.remove('is-tilting')
  }

  return (
    <div ref={element} className={`tilt ${className}`.trim()} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </div>
  )
}
