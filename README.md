# Jarred Ward · Portfolio

<!-- After the first deploy, add: **Live:** https://<project>.pages.dev -->

Personal site for a vulnerability-management and GRC analyst. Single page, statically built, deployed on Cloudflare Pages. No template, no component library, no CSS framework: hand-written design tokens, CSS Modules, and one deliberate WebGL set piece.

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 7, TypeScript (strict), React 19 |
| Styling | CSS Modules over hand-written custom-property tokens |
| Type | Archivo Variable (display), Public Sans Variable (body), IBM Plex Mono (labels), all self-hosted |
| Motion | Framer Motion for reveals; custom GLSL for the hero |
| 3D | three.js via react-three-fiber, no drei, no postprocessing |
| Hosting | Cloudflare Pages, static output only |

## The particle bust

The hero renders a portrait as tens of thousands of ember particles that assemble from scatter on load.

- **Asset pipeline:** the source photo never enters the repo. A one-time local pass runs a `rembg` cutout, then `scripts/make-bust-source.mjs` (sharp) downsamples it to a 340×408 grayscale+alpha matte of about 100 KB. That committed matte is the only portrait data the build ever sees.
- **Runtime:** the matte is sampled into a `THREE.Points` geometry (full density on desktop, quarter on mobile). Position comes from the pixel grid, depth relief from luminance.
- **Shader choreography:** staggered expo-out assembly, idle drift, head-only rotation soft-skinned around a neck pivot measured from the silhouette (the collar stays still), cursor repulsion driven by coherent value noise so the break-apart tears in ragged clumps instead of a clean circle, a periodic scan sweep, a tap shockwave ring, and a turbulent scroll dissolve.
- **Degrade paths:** `prefers-reduced-motion` renders the formed portrait statically; no WebGL falls back to a pre-rendered poster of the same composition. The three.js chunk is lazy-loaded so the largest contentful paint is hero text, and the render loop pauses when the hero leaves the viewport.

<details>
<summary>Regenerating the bust from a new photo</summary>

```bash
# 1. Subject cutout (throwaway venv)
python3 -m venv /tmp/rembg-venv
/tmp/rembg-venv/bin/pip install "rembg[cpu]" pillow
/tmp/rembg-venv/bin/python -c "from rembg import remove; from PIL import Image; \
  remove(Image.open('HEADSHOT.jpg').convert('RGBA')).save('/tmp/cutout.png')"

# 2. Build the matte (the no-WebGL poster is generated the same way)
node scripts/make-bust-source.mjs /tmp/cutout.png
```

</details>

## Two themes, one contrast discipline

Dark is the authored default: warm charcoal, an ember gradient on a strict budget, additive-blended particle glow. Light is opt-in ("ink on paper"): the same portrait re-rendered as a normal-blended ink stipple via a `uThemeMix` shader branch that reduces exactly to the dark math when off, with every glow effect re-authored as rust-and-ink.

- Every token pair in both themes is WCAG-verified: body text ≥ 15:1, secondary ≥ 7:1, small accents ≥ 4.5:1, crimson reserved for large decorative use.
- The preference persists in `localStorage` and applies before first paint via `public/theme.js`, kept as an external same-origin file because the CSP forbids inline scripts.
- Theme switches crossfade through the View Transitions API where supported and degrade to an instant swap.

## Fail-safe GitHub integration

`npm run build` first runs `scripts/fetch-pinned.mjs` (the `prebuild` step), which queries the GitHub GraphQL API for pinned repositories and rewrites `src/data/pinned.json`. Every failure mode (no token, bad token, rate limit, network error, malformed response) logs a warning, keeps the committed fallback, and exits 0. **The build never fails because of GitHub, and the Projects section is never empty.** The client never calls any API.

## Security posture

The site makes zero external requests at runtime (fonts, styles, and scripts are all first-party), which allows a strict header set in `public/_headers`:

- `Content-Security-Policy: default-src 'self'` with `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, locked-down `Permissions-Policy`
- The résumé path is excluded from indexing via `X-Robots-Tag` and `robots.txt`

## Performance and accessibility

Initial JavaScript is ~114 KB gzipped; the three.js scene ships as a separate ~234 KB lazy chunk off the critical path. Canvas layout space is reserved (no CLS), fingerprinted assets are immutable-cached for a year, and fonts are subsetted woff2.

Skip link, semantic landmarks, visible `:focus-visible` rings, labeled icon controls, `aria-hidden` canvas, and full `prefers-reduced-motion` coverage: static bust, opacity-only reveals, no parallax, no orbit or pulse animations.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # runs the pinned-repos fetch, then tsc + vite build → dist/
npm run preview    # serve the production build locally
```

---

## Setup checklist (one-time)

### 1. Résumé PDF

Drop the scrubbed résumé at `public/resume/Jarred-Ward-Resume.pdf`. Until then,
the "Download résumé" button will 404.

- Include only: name, professional email, LinkedIn, cert list, work history.
- Remove: phone number, home address, DOB.
- Strip file metadata before committing:
  ```bash
  exiftool -all= public/resume/Jarred-Ward-Resume.pdf
  ```

The PDF is served with `X-Robots-Tag: noindex, nofollow` (see `public/_headers`)
and disallowed in `public/robots.txt`, so it is linked but not independently
indexed by search engines.

### 2. GitHub token (for live pinned repos)

1. GitHub → Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
2. Name it `portfolio-site-readonly`, set an expiration (you'll rotate it later).
3. Repository access → **Public Repositories (read-only)**. No extra scopes needed.
4. Copy the token immediately (GitHub shows it once).

### 3. Cloudflare Pages

1. Workers & Pages → Create → Pages → Connect to Git → select this repo.
2. Build command: `npm run build` · Output directory: `dist`.
3. Settings → Environment variables → add `GITHUB_TOKEN`, paste the token, mark
   it **Encrypt** (secret). Add it for both **Production** and **Preview**.

Every push triggers a rebuild, which re-fetches the pinned repos with fresh data.
To refresh the Projects section, just re-pin repos on GitHub and redeploy. No
code changes required.

### Local build test with the token

```bash
GITHUB_TOKEN=your_token_here npm run build
# confirm: "[fetch-pinned] Wrote N pinned repos to src/data/pinned.json."
```

`.env` is gitignored if you prefer a local file. **Never commit the token.**

---

## Editing content

All copy is sourced from Jarred's LinkedIn profile and GitHub. To edit:

- **Timeline / bio**: `src/data/timeline.ts`, `src/data/site.ts`
- **Certifications**: `src/data/certs.ts`
- **Projects fallback**: `src/data/pinned.json` (auto-refreshed at build)
- **Social preview image**: regenerate with `node scripts/make-og.mjs`
