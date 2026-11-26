import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Diagram } from '@/content/types'
import { usePrefersReducedMotion } from '@/lib/hooks'

interface Props {
  diagram: Diagram
  /** Accessible name of the figure. */
  label: string
  /** Smaller nodes without the detail line and without interaction: used as a card visual. */
  compact?: boolean
  /** Animated packets travelling along the links. */
  animated?: boolean
}

interface LinkPath {
  key: string
  from: string
  to: string
  d: string
  dashed: boolean
}

interface Box {
  left: number
  right: number
  top: number
  bottom: number
  cx: number
  cy: number
}

/** Offset that keeps a left-to-right link and a right-to-left link from sharing an anchor point. */
const LANE_OFFSET = 7

function buildPath(source: Box, target: Box, sameLane: boolean, stacked: boolean): string {
  // "Along" is the axis lanes are laid out on: x on wide layouts, y when lanes are stacked.
  const horizontal = stacked ? sameLane : !sameLane
  if (horizontal) {
    const forward = source.cx <= target.cx
    const offset = forward ? -LANE_OFFSET : LANE_OFFSET
    const x1 = forward ? source.right : source.left
    const x2 = forward ? target.left : target.right
    const y1 = source.cy + offset
    const y2 = target.cy + offset
    const bend = Math.max(Math.abs(x2 - x1) * 0.5, 16) * (forward ? 1 : -1)
    return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`
  }
  const downward = source.cy <= target.cy
  const offset = downward ? -LANE_OFFSET : LANE_OFFSET
  const y1 = downward ? source.bottom : source.top
  const y2 = downward ? target.top : target.bottom
  const x1 = source.cx + offset
  const x2 = target.cx + offset
  const bend = Math.max(Math.abs(y2 - y1) * 0.5, 12) * (downward ? 1 : -1)
  return `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`
}

const round = (value: number) => Math.round(value * 10) / 10

/**
 * A lane-based architecture diagram rendered from data.
 *
 * Nodes are ordinary HTML (so they wrap, scale with text and are readable by assistive
 * technology); the links are an SVG overlay measured from the real node positions, which
 * lets the same data lay out as columns on wide containers and as stacked rows on narrow ones.
 */
export function ArchitectureDiagram({ diagram, label, compact = false, animated = false }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const canvasRef = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<LinkPath[]>([])
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const active = compact ? null : (hovered ?? pinned)

  const laneOf = useMemo(() => {
    const map = new Map<string, number>()
    diagram.lanes.forEach((lane, index) => lane.nodes.forEach((node) => map.set(node.id, index)))
    return map
  }, [diagram])

  const nodeById = useMemo(() => {
    const map = new Map(diagram.lanes.flatMap((lane) => lane.nodes.map((node) => [node.id, node] as const)))
    return map
  }, [diagram])

  const measure = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const origin = canvas.getBoundingClientRect()
    const boxes = new Map<string, Box>()
    canvas.querySelectorAll<HTMLElement>('[data-node]').forEach((element) => {
      const rect = element.getBoundingClientRect()
      const left = rect.left - origin.left
      const top = rect.top - origin.top
      boxes.set(element.dataset.node ?? '', {
        left,
        top,
        right: left + rect.width,
        bottom: top + rect.height,
        cx: left + rect.width / 2,
        cy: top + rect.height / 2,
      })
    })

    const lanes = canvas.querySelectorAll<HTMLElement>('[data-lane]')
    const first = lanes[0]?.getBoundingClientRect()
    const second = lanes[1]?.getBoundingClientRect()
    const stacked = Boolean(first && second && second.top >= first.bottom - 1)

    const next: LinkPath[] = []
    for (const link of diagram.links) {
      const source = boxes.get(link.from)
      const target = boxes.get(link.to)
      if (!source || !target) continue
      const sameLane = laneOf.get(link.from) === laneOf.get(link.to)
      const d = buildPath(source, target, sameLane, stacked).replace(/-?\d+\.\d+/g, (n) => String(round(Number(n))))
      next.push({ key: `${link.from}>${link.to}`, from: link.from, to: link.to, d, dashed: Boolean(link.dashed) })
    }
    setPaths(next)
    setSize({ width: round(origin.width), height: round(origin.height) })
  }, [diagram, laneOf])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(canvas)
    // Web fonts change node sizes after first paint.
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [measure])

  const related = useMemo(() => {
    if (!active) return null
    const ids = new Set<string>([active])
    for (const link of diagram.links) {
      if (link.from === active) ids.add(link.to)
      if (link.to === active) ids.add(link.from)
    }
    return ids
  }, [active, diagram.links])

  const note = active ? nodeById.get(active)?.note : undefined

  return (
    <figure
      className={`diagram${compact ? ' diagram--compact' : ''}`}
      aria-label={label}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="diagram__canvas" ref={canvasRef}>
        <svg
          className="diagram__links"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {(['', '-active'] as const).map((variant) => (
              <marker
                key={variant}
                id={`arrow${variant}-${uid}`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M1,1 L7,4 L1,7" className={`diagram__arrow${variant ? ' diagram__arrow--active' : ''}`} />
              </marker>
            ))}
          </defs>
          {paths.map((path) => {
            const isActive = active !== null && (path.from === active || path.to === active)
            const state = active === null ? '' : isActive ? ' is-active' : ' is-dim'
            return (
              <path
                key={path.key}
                d={path.d}
                className={`diagram__link${path.dashed ? ' diagram__link--dashed' : ''}${state}`}
                markerEnd={`url(#arrow${isActive ? '-active' : ''}-${uid})`}
              />
            )
          })}
          {animated &&
            !reducedMotion &&
            paths.map((path, index) => (
              <circle key={`packet-${path.key}`} r="2.4" className="diagram__packet">
                <animateMotion
                  dur={`${3.2 + (index % 4) * 0.5}s`}
                  begin={`-${((index * 0.85) % 3.2).toFixed(2)}s`}
                  repeatCount="indefinite"
                  path={path.d}
                />
              </circle>
            ))}
        </svg>

        <div className="diagram__lanes" style={{ ['--lanes' as string]: diagram.lanes.length }}>
          {diagram.lanes.map((lane) => (
            <div className="diagram__lane" data-lane key={lane.label}>
              <span className="diagram__lane-label">{lane.label}</span>
              <div className="diagram__nodes">
                {lane.nodes.map((node) => {
                  const state =
                    related === null ? '' : node.id === active ? ' is-active' : related.has(node.id) ? ' is-related' : ' is-dim'
                  const body = (
                    <>
                      <span className="diagram__node-label">{node.label}</span>
                      {!compact && node.detail && <span className="diagram__node-detail">{node.detail}</span>}
                    </>
                  )
                  return compact ? (
                    <div className="diagram__node" data-node={node.id} key={node.id}>
                      {body}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`diagram__node${state}`}
                      data-node={node.id}
                      key={node.id}
                      aria-pressed={pinned === node.id}
                      aria-describedby={`note-${uid}`}
                      onMouseEnter={() => setHovered(node.id)}
                      onFocus={() => setHovered(node.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setPinned((current) => (current === node.id ? null : node.id))}
                    >
                      {body}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!compact && (
        <figcaption className="diagram__note" id={`note-${uid}`} aria-live="polite">
          {note ? (
            <>
              <strong>{nodeById.get(active ?? '')?.label}.</strong> {note}
            </>
          ) : (
            <span className="diagram__caption">
              {diagram.caption ? `${diagram.caption} ` : ''}Select a node to see how it is used.
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
