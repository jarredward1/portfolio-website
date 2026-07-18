import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleBust, type BustSamples } from './sampleBust'
import { bustVertex, bustFragment } from './shaders'
import bustSrc from '../../assets/bust-source.png'

const WORLD_HEIGHT = 3.3
const SHADOW = new THREE.Color('#801622')
const EMBER = new THREE.Color('#cd4a16')
const AMBER = new THREE.Color('#e8912f')
const GOLD = new THREE.Color('#f6c87a')

// How far the head turns to follow the cursor (radians).
const HEAD_YAW_MAX = 0.42
const HEAD_PITCH_MAX = 0.17

export interface BustPointer {
  /** Window-normalized cursor (-1..1), drives the head turn. */
  wx: number
  wy: number
  /** Canvas-normalized cursor (-1..1, y up), drives the particle repulsion. */
  cx: number
  cy: number
  /** Whether the cursor is over (or near) the bust canvas. */
  inside: boolean
}

interface BustPointsProps {
  reduced: boolean
  pointer: React.RefObject<BustPointer>
  /** 0 at the top of the page, 1 once the hero has mostly scrolled away. */
  exit: React.RefObject<number>
}

export default function BustPoints({ reduced, pointer, exit }: BustPointsProps) {
  const { gl, invalidate } = useThree()
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const [samples, setSamples] = useState<BustSamples | null>(null)
  const progress = useRef(0)
  const startAt = useRef<number | null>(null)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 760
  const dpr = Math.min(gl.getPixelRatio(), 2)

  useEffect(() => {
    let alive = true
    sampleBust(bustSrc, {
      stride: isMobile ? 2 : 1,
      alphaThreshold: 40,
      worldHeight: WORLD_HEIGHT,
      depth: 0.1,
      scatterRadius: 2.6,
    }).then((s) => {
      if (alive) setSamples(s)
    })
    return () => {
      alive = false
    }
  }, [isMobile])

  const geometry = useMemo(() => {
    if (!samples) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(samples.positions, 3))
    g.setAttribute('aScatter', new THREE.BufferAttribute(samples.scatter, 3))
    g.setAttribute('aRandom', new THREE.BufferAttribute(samples.random, 1))
    g.setAttribute('aShade', new THREE.BufferAttribute(samples.shade, 1))
    return g
  }, [samples])

  const uniforms = useMemo(
    () => ({
      uProgress: { value: reduced ? 1 : 0 },
      uTime: { value: 0 },
      uSize: { value: (isMobile ? 22 : 12.5) * dpr },
      uReduced: { value: reduced ? 1 : 0 },
      uOpacity: { value: 0.95 },
      uHeadYaw: { value: 0 },
      uHeadPitch: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, -10) },
      uForce: { value: 0 },
      uExit: { value: 0 },
      uColorA: { value: SHADOW },
      uColorB: { value: EMBER },
      uColorC: { value: AMBER },
      uColorD: { value: GOLD },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dpr, isMobile],
  )

  useEffect(() => {
    if (reduced && matRef.current) {
      matRef.current.uniforms.uProgress.value = 1
      matRef.current.uniforms.uReduced.value = 1
      progress.current = 1
    }
  }, [reduced])

  // In demand mode (reduced motion / paused) render at least once when the
  // geometry is ready so the formed bust appears.
  useEffect(() => {
    if (geometry) invalidate()
  }, [geometry, reduced, invalidate])

  useEffect(() => {
    return () => {
      geometry?.dispose()
    }
  }, [geometry])

  useFrame((state, delta) => {
    const mat = matRef.current
    if (!mat) return

    const t = state.clock.elapsedTime
    mat.uniforms.uTime.value = t

    // Assembly: begin shortly after mount, expo-out over ~1.5s.
    if (!reduced) {
      if (startAt.current === null) startAt.current = t + 0.25
      const elapsed = t - startAt.current
      if (elapsed >= 0) {
        const lin = Math.min(elapsed / 1.5, 1)
        progress.current = 1 - Math.pow(2, -10 * lin)
      }
      mat.uniforms.uProgress.value = progress.current
    }

    const pt = pointer.current
    if (!reduced && pt) {
      const u = mat.uniforms
      const dt = Math.min(delta, 0.1)

      // Head turn: damped toward the window-space cursor, wherever it is.
      u.uHeadYaw.value = THREE.MathUtils.damp(u.uHeadYaw.value, pt.wx * HEAD_YAW_MAX, 5, dt)
      u.uHeadPitch.value = THREE.MathUtils.damp(u.uHeadPitch.value, pt.wy * HEAD_PITCH_MAX, 5, dt)

      // Repulsion: cursor mapped onto the bust plane in world units. Force
      // eases in over the canvas and heals to zero once the cursor leaves.
      const targetX = (pt.cx * state.viewport.width) / 2
      const targetY = (pt.cy * state.viewport.height) / 2
      u.uPointer.value.x = THREE.MathUtils.damp(u.uPointer.value.x, targetX, 12, dt)
      u.uPointer.value.y = THREE.MathUtils.damp(u.uPointer.value.y, targetY, 12, dt)
      u.uForce.value = THREE.MathUtils.damp(u.uForce.value, pt.inside ? 1 : 0, 5, dt)
    }

    // Scroll dissolve follows the hero's exit progress.
    if (!reduced) {
      const dt = Math.min(delta, 0.1)
      mat.uniforms.uExit.value = THREE.MathUtils.damp(
        mat.uniforms.uExit.value,
        exit.current ?? 0,
        6,
        dt,
      )
    }
  })

  if (!geometry) return null

  return (
    <group>
      <points frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={bustVertex}
          fragmentShader={bustFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
