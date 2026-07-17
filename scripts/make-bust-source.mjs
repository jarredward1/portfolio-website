/**
 * ONE-TIME preprocessing: turn Jarred's headshot into a compact grayscale+alpha
 * matte that the hero particle system samples at runtime.
 *
 * The raw photo never enters the repo; only the derived matte (src/assets/
 * bust-source.png, ~240×288) is committed.
 *
 * Pipeline (documented so it can be reproduced if the photo changes):
 *   1. Subject cutout via rembg (U2Net) in a throwaway venv:
 *        python -m venv /tmp/rembg-venv
 *        /tmp/rembg-venv/bin/pip install "rembg[cpu]" pillow
 *        /tmp/rembg-venv/bin/python -c "from rembg import remove; from PIL import Image; \
 *          remove(Image.open('HEADSHOT.jpg').convert('RGBA')).save('/tmp/headshot-cutout.png')"
 *   2. This script downsamples that cutout to the matte:
 *        node scripts/make-bust-source.mjs /tmp/headshot-cutout.png
 *
 * Output channels:
 *   RGB = contrast-lifted grayscale  → per-point relief depth + shading
 *   A   = subject matte (from rembg) → which points exist (the silhouette)
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const SRC = process.argv[2]
if (!SRC) {
  console.error('Usage: node scripts/make-bust-source.mjs <path-to-cutout.png>')
  process.exit(1)
}

const OUT = fileURLToPath(new URL('../src/assets/bust-source.png', import.meta.url))
const W = 340
const H = 408

// Trim transparent margins so the subject fills the frame consistently, then
// fit head-and-shoulders into the canvas anchored near the top.
const prepared = sharp(SRC).ensureAlpha().trim({ threshold: 10 }).resize(W, H, {
  fit: 'contain',
  position: 'top',
  background: { r: 0, g: 0, b: 0, alpha: 0 },
})

const { data, info } = await prepared.raw().toBuffer({ resolveWithObject: true })
const channels = info.channels // 4

// Grayscale relief from RGB, contrast-lifted so the dark face keeps structure.
const grayRaw = Buffer.alloc(W * H)
const alphaRaw = Buffer.alloc(W * H)
for (let i = 0; i < W * H; i++) {
  const r = data[i * channels + 0]
  const g = data[i * channels + 1]
  const b = data[i * channels + 2]
  const a = data[i * channels + 3]
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  grayRaw[i] = lum
  alphaRaw[i] = a
}

// Portrait-fidelity curve: normalise to full range, a moderate midtone lift so
// the face reads on a dark page, and a mild sharpen so eyes, beard line, and
// the tie pattern survive the downsample. No hard linear boost: tonal ORDER is
// what makes the portrait legible, so highlights must not clip.
// NOTE: sharp promotes a 1-channel raw input to 3 channels through these ops,
// so read the real channel count back and sample channel 0 (R=G=B here).
const grayOut = await sharp(grayRaw, { raw: { width: W, height: H, channels: 1 } })
  .normalise().clahe({ width: 42, height: 42, maxSlope: 3 })  .gamma(1.3)
  .sharpen({ sigma: 0.7 })
  .raw()
  .toBuffer({ resolveWithObject: true })

// Feather the matte edge so the point boundary dissolves rather than cuts.
const alphaOut = await sharp(alphaRaw, { raw: { width: W, height: H, channels: 1 } })
  .blur(0.8)
  .raw()
  .toBuffer({ resolveWithObject: true })

const gStride = grayOut.info.channels
const aStride = alphaOut.info.channels

const rgba = Buffer.alloc(W * H * 4)
for (let i = 0; i < W * H; i++) {
  const g = grayOut.data[i * gStride]
  rgba[i * 4 + 0] = g
  rgba[i * 4 + 1] = g
  rgba[i * 4 + 2] = g
  rgba[i * 4 + 3] = alphaOut.data[i * aStride]
}

await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .png()
  .toFile(OUT)

console.log(`[make-bust-source] Wrote ${OUT} (${W}×${H}).`)
