/**
 * Loads the committed bust matte and samples it into typed arrays the particle
 * system consumes. RGB carries shading/detail relief; alpha carries the
 * silhouette, which also drives the volume inflation that rounds the bust.
 */
export interface BustSamples {
  count: number
  positions: Float32Array // xyz, formed position (world units)
  scatter: Float32Array // xyz, per-point assembly origin offset
  random: Float32Array // 1 per point, 0..1 (stagger + drift seed)
  shade: Float32Array // 1 per point, 0..1 luminance from the photo
  sizeFix: Float32Array // 1 per point, cancels resting perspective size gain
}

interface SampleOptions {
  /** Sample stride: 1 = every pixel, 2 = quarter density (mobile). */
  stride: number
  /** Alpha threshold (0..255) above which a point is emitted. */
  alphaThreshold: number
  /** World height of the bust; width derives from image aspect. */
  worldHeight: number
  /** Luminance surface-detail depth as a fraction of world height. */
  depth: number
  /** Silhouette-inflation depth as a fraction of world height. */
  inflateDepth: number
  /** Assembly scatter radius in world units. */
  scatterRadius: number
}

/** Camera distance in Bust.tsx's <Canvas camera={{ position: [0, 0, 5] }}>. */
const CAMERA_Z = 5

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

  // Silhouette inflation: each row's contiguous opaque runs become a circular
  // tube whose depth equals its half-width (in world units), capped so the
  // wide shoulder rows plateau instead of ballooning. Narrow rows (the crown,
  // stray hair) are naturally shallow, the head comes out near-spherical, and
  // the bust reads as a rounded volume instead of a flat plate when the head
  // turns. Computed at full resolution (stride-independent) so mobile and
  // desktop share the same form.
  const alphaAt = (x: number, y: number) => data[(y * w + x) * 4 + 3]
  const pxToWorld = worldW / w
  const cap = worldH * opts.inflateDepth
  const inflateRaw = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    let x = 0
    while (x < w) {
      if (alphaAt(x, y) < opts.alphaThreshold) {
        x++
        continue
      }
      let xEnd = x
      while (xEnd < w && alphaAt(xEnd, y) >= opts.alphaThreshold) xEnd++
      const half = Math.max((xEnd - 1 - x) / 2, 1)
      const xc = x + (xEnd - 1 - x) / 2
      for (let xi = x; xi < xEnd; xi++) {
        const dx = xi - xc
        const zPix = Math.sqrt(Math.max(0, half * half - dx * dx))
        inflateRaw[y * w + xi] = Math.min(zPix * pxToWorld * 0.9, cap)
      }
      x = xEnd
    }
  }

  // Small vertical box blur knits neighboring rows together, so hair wisps
  // and the collar step do not leave horizontal ridges on the form.
  const inflate = new Float32Array(w * h)
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sum = 0
      let n = 0
      for (let k = -2; k <= 2; k++) {
        const yy = y + k
        if (yy < 0 || yy >= h) continue
        sum += inflateRaw[yy * w + x]
        n++
      }
      inflate[y * w + x] = sum / n
    }
  }

  const positions: number[] = []
  const scatter: number[] = []
  const random: number[] = []
  const shade: number[] = []
  const sizeFix: number[] = []

  for (let y = 0; y < h; y += opts.stride) {
    for (let x = 0; x < w; x += opts.stride) {
      const i = (y * w + x) * 4
      const a = data[i + 3]
      if (a < opts.alphaThreshold) continue

      const lum = data[i] / 255 // R (== G == B) is our grayscale relief

      // Formed position, centered; flip Y (image space → world space).
      // Depth = rounded silhouette volume + luminance surface detail riding
      // on it, plus a little jitter for organic thickness. Both terms are
      // centered so the bust's average plane (and the head pivot) stay put.
      const pzVol = inflate[y * w + x] - cap * 0.45
      const pz = pzVol + (lum - 0.45) * worldH * opts.depth + (Math.random() - 0.5) * 0.02
      // Perspective-preserving inflation: scale xy and dot size by the SMOOTH
      // volume depth only, so the frontal view projects onto the same screen
      // raster as the flat matte (crisp portrait), while the head turn still
      // reveals the rounded form. Compensating with the full pz would smear
      // tonal edges: neighboring light/dark dots would get different scales.
      // CAMERA_Z must match Bust.tsx.
      const persp = (CAMERA_Z - pzVol) / CAMERA_Z
      const px = (x / w - 0.5) * worldW * persp
      const py = (0.5 - y / h) * worldH * persp

      positions.push(px, py, pz)
      sizeFix.push(persp)

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
    sizeFix: new Float32Array(sizeFix),
  }
}
