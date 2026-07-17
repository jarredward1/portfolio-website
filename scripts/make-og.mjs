/**
 * Regenerates public/og.png (1200x630 social share card): charcoal base with
 * the blueprint grid, an ember glow, the name block, and the bust portrait
 * composited on the right. Re-run after visual changes: node scripts/make-og.mjs
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../public/og.png', import.meta.url))
const POSTER = fileURLToPath(new URL('../src/assets/bust-poster.png', import.meta.url))

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#b91c2c"/>
      <stop offset="0.55" stop-color="#cd4a16"/>
      <stop offset="1" stop-color="#d97706"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.76" cy="0.58" r="0.6">
      <stop offset="0" stop-color="#b91c2c" stop-opacity="0.30"/>
      <stop offset="0.55" stop-color="#d97706" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#d97706" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="#f4f1ea" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0d0d0f"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="72" y="140" width="10" height="10" transform="rotate(45 77 145)" fill="url(#grad)"/>
  <text x="98" y="152" font-family="Menlo, Consolas, monospace" font-size="21" letter-spacing="6" fill="#f0a035">VULNERABILITY MANAGEMENT · GRC</text>
  <text x="66" y="298" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="900" font-size="110" letter-spacing="3" fill="#f4f1ea">JARRED</text>
  <text x="66" y="408" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="900" font-size="110" letter-spacing="3" fill="#f4f1ea">WARD</text>
  <rect x="72" y="448" width="260" height="4" fill="url(#grad)"/>
  <text x="72" y="512" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="26" fill="#a9a49b">Command judgment under pressure,</text>
  <text x="72" y="548" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="26" fill="#a9a49b">now applied to digital risk.</text>
</svg>`

const poster = await sharp(POSTER).resize({ height: 600 }).png().toBuffer()
const posterMeta = await sharp(poster).metadata()

await sharp(Buffer.from(svg))
  .png()
  .composite([{ input: poster, left: 1200 - posterMeta.width - 22, top: 630 - 600 }])
  .toFile(OUT)

console.log(`[make-og] Wrote ${OUT} (bust ${posterMeta.width}x${posterMeta.height}).`)
