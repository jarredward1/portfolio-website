import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import BustPoints, { type BustPointer } from './BustPoints'

interface BustProps {
  reduced: boolean
}

/**
 * The 3D signature element. This module pulls in three.js / r3f, so it is
 * lazy-loaded by the hero, keeping three out of the initial (LCP) bundle.
 */
export default function Bust({ reduced }: BustProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointer = useRef<BustPointer>({ wx: 0, wy: 0, cx: 0, cy: -10, inside: false })
  const exitRef = useRef(0)
  const [active, setActive] = useState(true)

  // Hero exit progress (0 at top, 1 once ~3/4 scrolled past) drives the
  // ember dissolve. Cheap: one rect read per scroll event.
  useEffect(() => {
    if (reduced) return
    const onScroll = () => {
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.height === 0) return
      exitRef.current = Math.min(Math.max(-r.top / (r.height * 0.6), 0), 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  // Pause the render loop when the hero is scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Track the cursor two ways: window-normalized for the head turn, and
  // canvas-normalized (plus an inside flag) for the particle repulsion.
  // Desktop pointers only; touch drags would fight page scrolling.
  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      const p = pointer.current
      p.wx = (e.clientX / window.innerWidth) * 2 - 1
      p.wy = (e.clientY / window.innerHeight) * 2 - 1

      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      p.cx = ((e.clientX - r.left) / r.width) * 2 - 1
      p.cy = -(((e.clientY - r.top) / r.height) * 2 - 1)
      p.inside =
        e.clientX >= r.left - 30 &&
        e.clientX <= r.right + 30 &&
        e.clientY >= r.top - 30 &&
        e.clientY <= r.bottom + 30
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  const frameloop = reduced || !active ? 'demand' : 'always'

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 2]}
        frameloop={frameloop}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <BustPoints reduced={reduced} pointer={pointer} exit={exitRef} />
      </Canvas>
    </div>
  )
}
