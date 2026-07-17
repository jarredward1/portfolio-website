/**
 * Loads the committed bust matte and samples it into typed arrays the particle
 * system consumes. RGB carries relief/shading, alpha carries the silhouette.
 */
export interface BustSamples {
  count: number
  positions: Float32Array // xyz, formed position (world units)
  scatter: Float32Array // xyz, per-point assembly origin offset
  random: Float32Array // 1 per point, 0..1 (stagger + drift seed)
  shade: Float32Array // 1 per point, 0..1 luminance from the photo
}

interface SampleOptions {
  /** Sample stride: 1 = every pixel, 2 = quarter density (mobile). */
  stride: number
  /** Alpha threshold (0..255) above which a point is emitted. */
  alphaThreshold: number
  /** World height of the bust; width derives from image aspect. */
  worldHeight: number
  /** Relief depth as a fraction of world height. */
  depth: number
  /** Assembly scatter radius in world units. */
  scatterRadius: number
}

export async function sampleBust(src: string, opts: SampleOptions): Promise<BustSamples> {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  await img.decode()

  const w = img.naturalWidth
  const h = img.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  const { data } = ctx.getImageData(0, 0, w, h)

  const aspect = w / h
  const worldW = opts.worldHeight * aspect
  const worldH = opts.worldHeight

  const positions: number[] = []
  const scatter: number[] = []
  const random: number[] = []
  const shade: number[] = []

  for (let y = 0; y < h; y += opts.stride) {
    for (let x = 0; x < w; x += opts.stride) {
      const i = (y * w + x) * 4
      const a = data[i + 3]
      if (a < opts.alphaThreshold) continue

      const lum = data[i] / 255 // R (== G == B) is our grayscale relief

      // Formed position, centered; flip Y (image space → world space).
      const px = (x / w - 0.5) * worldW
      const py = (0.5 - y / h) * worldH
      // Relief: brighter areas (shirt/highlights) push slightly forward, with
      // a little jitter so the sheet has organic thickness.
      const pz = (lum - 0.45) * worldH * opts.depth + (Math.random() - 0.5) * 0.05

      positions.push(px, py, pz)

      // Assembly origin: a random point on a sphere around the formed position.
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = opts.scatterRadius * (0.4 + Math.random() * 0.6)
      scatter.push(
        Math.sin(phi) * Math.cos(theta) * r,
        Math.sin(phi) * Math.sin(theta) * r,
        Math.cos(phi) * r,
      )

      random.push(Math.random())
      shade.push(lum)
    }
  }

  return {
    count: random.length,
    positions: new Float32Array(positions),
    scatter: new Float32Array(scatter),
    random: new Float32Array(random),
    shade: new Float32Array(shade),
  }
}
