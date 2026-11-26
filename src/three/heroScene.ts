import {
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from 'three'

/**
 * The hero's 3D scene: a wireframe core with services orbiting it, in a field of points.
 * It is a picture of the kind of system the page describes, drawn with the site's own colours.
 *
 * Kept out of React on purpose: nothing here needs a render, only a canvas and a clock.
 * Returns a function that stops the loop and frees every GPU resource.
 */
export function mountHeroScene(canvas: HTMLCanvasElement, options: { animate: boolean }): () => void {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch {
    // No WebGL (old device, blocked GPU): the hero simply keeps its CSS backdrop.
    return () => {}
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 15)

  const accent = new Color()
  const accent2 = new Color()
  const dust = new Color()

  // ----- Core: two nested wireframes around a solid nucleus -----
  const coreOuterMaterial = new LineBasicMaterial({ transparent: true, opacity: 0.5 })
  const coreInnerMaterial = new LineBasicMaterial({ transparent: true, opacity: 0.85 })
  const nucleusMaterial = new MeshBasicMaterial()
  const core = new Group()
  const outer = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(2.3, 1)), coreOuterMaterial)
  const inner = new LineSegments(new EdgesGeometry(new IcosahedronGeometry(1.25, 0)), coreInnerMaterial)
  const nucleus = new Mesh(new SphereGeometry(0.3, 24, 24), nucleusMaterial)
  core.add(outer, inner, nucleus)

  // ----- Orbits: tilted rings, each carrying satellites -----
  const ringMaterial = new LineBasicMaterial({ transparent: true, opacity: 0.3 })
  const satelliteMaterials = [new MeshBasicMaterial(), new MeshBasicMaterial()]
  const satelliteGeometry = new SphereGeometry(0.13, 16, 16)
  const orbits = [
    { radius: 3.3, tilt: [1.15, 0.2], speed: 0.5, satellites: 2 },
    { radius: 4.15, tilt: [1.45, -0.55], speed: -0.34, satellites: 3 },
    { radius: 5.0, tilt: [0.95, 0.75], speed: 0.24, satellites: 2 },
  ].map((config, orbitIndex) => {
    const points: number[] = []
    for (let step = 0; step < 160; step++) {
      const angle = (step / 160) * Math.PI * 2
      points.push(Math.cos(angle) * config.radius, Math.sin(angle) * config.radius, 0)
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
    const ring = new Group()
    ring.rotation.set(config.tilt[0] ?? 0, config.tilt[1] ?? 0, 0)
    ring.add(new LineLoop(geometry, ringMaterial))
    const satellites = Array.from({ length: config.satellites }, (_, index) => {
      const material = satelliteMaterials[(orbitIndex + index) % satelliteMaterials.length] ?? nucleusMaterial
      const mesh = new Mesh(satelliteGeometry, material)
      ring.add(mesh)
      return { mesh, offset: (index / config.satellites) * Math.PI * 2 }
    })
    return { ...config, ring, satellites, geometry }
  })

  // ----- Dust: points in a shell around everything -----
  const dustPositions: number[] = []
  for (let index = 0; index < 520; index++) {
    const radius = 5.5 + Math.random() * 7
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    dustPositions.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi))
  }
  const dustGeometry = new BufferGeometry()
  dustGeometry.setAttribute('position', new Float32BufferAttribute(dustPositions, 3))
  const dustMaterial = new PointsMaterial({ size: 0.06, transparent: true, opacity: 0.6, sizeAttenuation: true })
  const dustCloud = new Points(dustGeometry, dustMaterial)

  const world = new Group()
  world.add(core, ...orbits.map((orbit) => orbit.ring), dustCloud)
  scene.add(world)

  /** Colours come from the design tokens, so the scene follows the light and dark themes. */
  function readTheme() {
    const styles = getComputedStyle(document.documentElement)
    accent.set(styles.getPropertyValue('--accent').trim() || '#2fe6b7')
    accent2.set(styles.getPropertyValue('--accent-2').trim() || '#46b9ff')
    dust.set(styles.getPropertyValue('--text-faint').trim() || '#7d8a86')
    coreOuterMaterial.color.copy(accent)
    coreInnerMaterial.color.copy(accent2)
    nucleusMaterial.color.copy(accent)
    ringMaterial.color.copy(accent)
    satelliteMaterials[0]?.color.copy(accent)
    satelliteMaterials[1]?.color.copy(accent2)
    dustMaterial.color.copy(dust)
  }

  function placeSatellites(time: number) {
    for (const orbit of orbits) {
      for (const satellite of orbit.satellites) {
        const angle = satellite.offset + time * orbit.speed
        satellite.mesh.position.set(Math.cos(angle) * orbit.radius, Math.sin(angle) * orbit.radius, 0)
      }
    }
  }

  function resize() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Keep the outer orbit inside narrow canvases by pulling the camera back.
    camera.position.z = camera.aspect < 1 ? 15 / Math.max(camera.aspect, 0.6) : 15
    camera.updateProjectionMatrix()
  }

  const pointer = { x: 0, y: 0 }
  const onPointer = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  }

  let frame = 0
  let visible = true
  let last = performance.now()
  let time = 0

  function draw() {
    placeSatellites(time)
    renderer.render(scene, camera)
  }

  function tick(now: number) {
    frame = 0
    const delta = Math.min((now - last) / 1000, 0.05)
    last = now
    time += delta
    outer.rotation.y += delta * 0.22
    outer.rotation.x += delta * 0.08
    inner.rotation.y -= delta * 0.4
    inner.rotation.z += delta * 0.18
    dustCloud.rotation.y += delta * 0.015
    // Ease the whole scene towards the pointer for a little parallax.
    world.rotation.y += (pointer.x * 0.35 - world.rotation.y) * 0.04
    world.rotation.x += (pointer.y * 0.22 - world.rotation.x) * 0.04
    draw()
    schedule()
  }

  function schedule() {
    if (!options.animate || !visible || document.hidden || frame) return
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  const resizeObserver = new ResizeObserver(() => {
    resize()
    draw()
  })
  resizeObserver.observe(canvas)

  const viewObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
    schedule()
  })
  viewObserver.observe(canvas)

  const themeObserver = new MutationObserver(() => {
    readTheme()
    draw()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const onVisibility = () => schedule()
  document.addEventListener('visibilitychange', onVisibility)
  if (options.animate) window.addEventListener('pointermove', onPointer, { passive: true })

  readTheme()
  resize()
  draw()
  schedule()

  return () => {
    if (frame) cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    viewObserver.disconnect()
    themeObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pointermove', onPointer)
    outer.geometry.dispose()
    inner.geometry.dispose()
    nucleus.geometry.dispose()
    satelliteGeometry.dispose()
    dustGeometry.dispose()
    for (const orbit of orbits) orbit.geometry.dispose()
    for (const material of [coreOuterMaterial, coreInnerMaterial, nucleusMaterial, ringMaterial, dustMaterial, ...satelliteMaterials]) {
      material.dispose()
    }
    renderer.dispose()
  }
}
