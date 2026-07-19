import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/public-sans/wght.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'
import { site } from './data/site'

// Devtools console banner. Module-scope (not a component/useEffect) so it
// runs exactly once per real load regardless of StrictMode's dev-time
// double-invoking. %c has no cascade access, so tokens.css hex values are
// inlined literally.
//
// TODO: confirm this matches the repo's actual GitHub slug once pushed.
const repoUrl = `${site.github}/portfolio-website`

const badge =
  'background:#0d0d0f; color:#f4f1ea; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-weight:700; font-size:12px; letter-spacing:0.08em; padding:3px 7px; border-radius:3px;'
const headline = 'color:#a9a49b; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size:12px;'
const label = 'color:#858076; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size:11px;'
const link = 'color:#f0a035; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size:11px;'

console.log(`%c JW %c ${site.name} · ${site.role}`, badge, headline)
console.log(`%c// architecture notes + source: %c${repoUrl}`, label, link)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
