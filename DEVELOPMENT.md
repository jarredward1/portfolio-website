# Technical documentation

The full architecture, build pipeline, and setup notes for [jarredward.tech](https://jarredward.tech). See [README.md](README.md) for the plain-language overview.

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 7, TypeScript (strict), React 19 |
| Styling | CSS Modules over hand-written custom-property tokens |
| Type | Archivo Variable (display), Public Sans Variable (body), IBM Plex Mono (labels), all self-hosted |
| Motion | Framer Motion for reveals; custom GLSL for the hero |
| 3D | three.js via react-three-fiber, no drei, no postprocessing |
| Hosting | Cloudflare Pages, static output only |
| Contact form | Cloudflare Pages Function (`functions/api/contact.ts`) → Resend |

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

The fetch reruns unconditionally on every build — there's no caching or conditional skip. To refresh the Projects section with newly pinned repos: re-pin them at github.com/jarredward1, then either push any commit to this repo (the diff doesn't need to relate to pinned repos at all) or manually retrigger the latest deployment from the Cloudflare Pages dashboard (Deployments → Retry deployment), which reruns the full build with no commit required.

## Security posture

The site makes zero external requests at runtime (fonts, styles, and scripts are all first-party), which allows a strict header set in `public/_headers`:

- `Content-Security-Policy: default-src 'self'` with `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, locked-down `Permissions-Policy`
- The résumé path is excluded from indexing via `X-Robots-Tag` and `robots.txt`

The one runtime request the site does make is the contact form's same-origin `POST /api/contact`, handled entirely by a Cloudflare Pages Function — no CSP change needed since `connect-src 'self'` already permits it. The form carries a honeypot field as its spam defense (off-screen, not `display:none`, so scrapers that check computed visibility still fall for it); every field is re-validated server-side regardless of what the browser already checked.

## Performance and accessibility

Initial JavaScript is ~114 KB gzipped; the three.js scene ships as a separate ~234 KB lazy chunk off the critical path. Canvas layout space is reserved (no CLS), fingerprinted assets are immutable-cached for a year, and fonts are subsetted woff2.

Skip link, semantic landmarks, visible `:focus-visible` rings, labeled icon controls, `aria-hidden` canvas, and full `prefers-reduced-motion` coverage: static bust, opacity-only reveals, no parallax, no orbit or pulse animations.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # runs the pinned-repos fetch, then tsc + vite build → dist/
npm run preview    # serve the production build locally
npm run pages:dev  # wrangler pages dev, needed to exercise functions/api/contact.ts locally
```

---

## Setup checklist (one-time, for standing this up from scratch)

### 1. Résumé PDF

Drop the scrubbed résumé at `public/resume/Jarred-Ward-Resume.pdf`.

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

1. Workers & Pages → Create application → **Pages** (not Worker) → Connect to Git → select this repo.
2. Build command: `npm run build` · Output directory: `dist`.
3. Settings → Environment variables → add `GITHUB_TOKEN`, paste the token, mark
   it **Encrypt** (secret). Add it for both **Production** and **Preview**.

Every push triggers a rebuild, which re-fetches the pinned repos with fresh data.

### 4. Resend (email delivery for the contact form)

1. Sign up at [resend.com](https://resend.com) and generate an API key.
2. Cloudflare Pages → Settings → Environment variables → add `RESEND_API_KEY`,
   paste the key, mark it **Encrypt**. Add it for both **Production** and
   **Preview** — same mechanics as `GITHUB_TOKEN` above.
3. For local testing, create a `.dev.vars` file at the repo root (gitignored):
   ```
   RESEND_API_KEY=re_xxxxxxxxx
   ```
   then run `npm run pages:dev` instead of `npm run dev` to exercise
   `functions/api/contact.ts` locally via `wrangler`.
4. Add the sending domain in Resend → Domains, and add the DNS records it
   gives you (in Cloudflare's DNS tab, if the domain lives there). Once
   verified, `functions/api/contact.ts`'s `from` address can send as
   `contact@<domain>` instead of the shared `onboarding@resend.dev`.

### 5. Custom domain

Two separate verifications, not one:
- **Hosting**: Cloudflare Pages project → Custom domains → add the domain.
- **Email sending**: Resend → Domains (see step 4.4) — independent DNS records from hosting.

If you also want a `www` variant to redirect to the apex domain instead of serving duplicate content, add it as a second custom domain, then Rules → Redirect Rules → **Redirect from WWW to root** template, with Request URL `https://www.<domain>/*` and Target URL `https://<domain>/${1}` (the auto-filled wildcard pattern needs correcting to this — the default template placement of the wildcard is wrong).

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
