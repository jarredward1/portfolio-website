# Jarred Ward · Portfolio

Personal portfolio site. Static build (Vite + React + TypeScript), deployed to
Cloudflare Pages. The hero features a 3D particle bust (react-three-fiber); the
Projects section is populated at build time from GitHub's pinned repositories.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # runs the pinned-repos fetch, then tsc + vite build → dist/
npm run preview    # serve the production build locally
```

`npm run build` first runs `scripts/fetch-pinned.mjs` (the `prebuild` step). If
`GITHUB_TOKEN` is unset or the API call fails, it keeps the committed fallback in
`src/data/pinned.json` and exits cleanly. **The build never fails because of
GitHub, and the Projects section is never empty.**

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

## Content

All copy is sourced from Jarred's LinkedIn profile and GitHub. To edit:

- **Timeline / bio**: `src/data/timeline.ts`, `src/data/site.ts`
- **Certifications**: `src/data/certs.ts`
- **Projects fallback**: `src/data/pinned.json` (auto-refreshed at build)

## Regenerating the hero bust

The particle bust samples `src/assets/bust-source.png` (a compact grayscale +
alpha matte derived from a headshot; the raw photo is never committed). To
regenerate from a new photo:

```bash
# 1. Subject cutout (throwaway venv)
python3 -m venv /tmp/rembg-venv
/tmp/rembg-venv/bin/pip install "rembg[cpu]" pillow
/tmp/rembg-venv/bin/python -c "from rembg import remove; from PIL import Image; \
  remove(Image.open('HEADSHOT.jpg').convert('RGBA')).save('/tmp/cutout.png')"

# 2. Build the matte (and the no-WebGL poster is generated the same way)
node scripts/make-bust-source.mjs /tmp/cutout.png
```

## Accessibility & performance notes

- `prefers-reduced-motion` is respected everywhere: the bust renders a static
  formed state, and section reveals become simple fades.
- No WebGL → the hero falls back to a static poster image.
- three.js is code-split into a lazy chunk so it never blocks first paint.
- The site makes **zero external runtime requests**; a strict `default-src
  'self'` CSP is set in `public/_headers`.
