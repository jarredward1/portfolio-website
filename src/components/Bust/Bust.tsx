import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import BustPoints from './BustPoints'

interface BustProps {
  reduced: boolean
}

/**
 * The 3D signature element. This module pulls in three.js / r3f, so it is
 * lazy-loaded by the hero — keeping three out of the initial (LCP) bundle.
 */
export default function Bust({ reduced }: BustProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const [active, setActive] = useState(true)

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

  // Track pointer for parallax (normalized -1..1, damped in the render loop).
  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
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
        <BustPoints reduced={reduced} pointer={pointer} />
      </Canvas>
    </div>
  )
}
