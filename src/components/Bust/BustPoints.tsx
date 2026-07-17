import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleBust, type BustSamples } from './sampleBust'
import { bustVertex, bustFragment } from './shaders'
import bustSrc from '../../assets/bust-source.png'

const WORLD_HEIGHT = 3.3
const CRIMSON = new THREE.Color('#b91c2c')
const EMBER = new THREE.Color('#cd4a16')
const AMBER = new THREE.Color('#e8912f')

interface BustPointsProps {
  reduced: boolean
  pointer: React.RefObject<{ x: number; y: number }>
}

export default function BustPoints({ reduced, pointer }: BustPointsProps) {
  const { gl, invalidate } = useThree()
  const groupRef = useRef<THREE.Group>(null)
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
      depth: 0.16,
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
      uSize: { value: 16 * dpr },
      uReduced: { value: reduced ? 1 : 0 },
      uOpacity: { value: 0.92 },
      uColorA: { value: CRIMSON },
      uColorB: { value: EMBER },
      uColorC: { value: AMBER },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dpr],
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

  useFrame((state) => {
    const mat = matRef.current
    const group = groupRef.current
    if (!mat || !group) return

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

    // Pointer parallax — damped rotation toward the cursor target.
    if (!reduced && pointer.current) {
      const targetY = pointer.current.x * 0.32
      const targetX = pointer.current.y * 0.18
      group.rotation.y += (targetY - group.rotation.y) * 0.05
      group.rotation.x += (targetX - group.rotation.x) * 0.05
    }
  })

  if (!geometry) return null

  return (
    <group ref={groupRef}>
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
