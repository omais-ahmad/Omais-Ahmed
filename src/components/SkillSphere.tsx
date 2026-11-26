import { useEffect, useRef } from 'react'
import type { Skill } from '@/content/types'
import { usePrefersReducedMotion } from '@/lib/hooks'

interface Point {
  x: number
  y: number
  z: number
}

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
function spherePoints(count: number): Point[] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, index) => {
    const y = count === 1 ? 0 : 1 - (index / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const angle = index * golden
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius }
  })
}

const AUTO_SPEED = 0.25 // radians per second
const FRICTION = 0.94

/**
 * A sphere of skill names that turns slowly and can be dragged in any direction.
 * The labels are real text placed in 3D with a perspective scale, not a canvas.
 * It repeats the lists below it, so it is hidden from assistive technology.
 */
export function SkillSphere({ skills }: { skills: Skill[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const element = stage.current
    if (!element) return
    const labels = Array.from(element.querySelectorAll<HTMLElement>('[data-skill]'))
    const points = spherePoints(labels.length)
    let radius = 0
    let velocityX = 0
    let velocityY = reducedMotion ? 0 : AUTO_SPEED
    let dragging = false
    let lastX = 0
    let lastY = 0
    let frame = 0
    let visible = true
    let last = performance.now()

    const rotate = (angleX: number, angleY: number) => {
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      for (const point of points) {
        // Around the vertical axis first...
        const x = point.x * cosY + point.z * sinY
        const z = -point.x * sinY + point.z * cosY
        // ...then around the horizontal one.
        const y = point.y * cosX - z * sinX
        point.z = point.y * sinX + z * cosX
        point.x = x
        point.y = y
      }
    }

    const paint = () => {
      labels.forEach((label, index) => {
        const point = points[index]
        if (!point) return
        const depth = (point.z + 1) / 2 // 0 at the back, 1 at the front
        const scale = 0.62 + depth * 0.58
        label.style.transform = `translate(-50%, -50%) translate3d(${(point.x * radius).toFixed(1)}px, ${(point.y * radius).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
        label.style.opacity = (0.18 + depth * 0.82).toFixed(3)
        label.style.zIndex = String(Math.round(depth * 100))
      })
    }

    const measure = () => {
      radius = Math.min(element.clientWidth, element.clientHeight) * 0.4
      paint()
    }

    const tick = (now: number) => {
      frame = 0
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!dragging) {
        // Drift back to the idle spin after a throw.
        velocityX *= FRICTION
        const idle = reducedMotion ? 0 : AUTO_SPEED
        velocityY = idle + (velocityY - idle) * FRICTION
      }
      rotate(velocityX * delta, velocityY * delta)
      paint()
      schedule()
    }

    const moving = () => dragging || Math.abs(velocityX) > 0.002 || Math.abs(velocityY) > 0.002
    function schedule() {
      if (frame || !visible || document.hidden || !moving()) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const onDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      element.setPointerCapture(event.pointerId)
      element.classList.add('is-dragging')
      schedule()
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      // Rotate by the distance dragged, and remember it as the throw velocity.
      rotate(-dy * 0.006, dx * 0.006)
      velocityY = dx * 0.35
      velocityX = -dy * 0.35
      paint()
    }
    const onUp = (event: PointerEvent) => {
      dragging = false
      element.classList.remove('is-dragging')
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
      schedule()
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(element)
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      schedule()
    })
    viewObserver.observe(element)
    const onVisibility = () => schedule()
    document.addEventListener('visibilitychange', onVisibility)
    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerup', onUp)
    element.addEventListener('pointercancel', onUp)

    measure()
    schedule()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      viewObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onUp)
      element.removeEventListener('pointercancel', onUp)
    }
  }, [skills, reducedMotion])

  return (
    <div className="sphere" ref={stage} aria-hidden="true">
      <span className="sphere__core" />
      {skills.map((skill) => (
        <span key={skill.name} data-skill className={`sphere__label sphere__label--${skill.level}`}>
          {skill.name}
        </span>
      ))}
    </div>
  )
}
