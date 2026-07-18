/**
 * Theme store. Dark is the authored default; light is opt-in via the nav
 * toggle and persists in localStorage. public/theme.js applies a stored
 * preference before first paint; this module owns every change after that.
 */
export type Theme = 'dark' | 'light'

const KEY = 'jw-theme'
const root = document.documentElement

let current: Theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
const listeners = new Set<() => void>()

function apply(next: Theme) {
  current = next
  if (next === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* storage unavailable: the choice just won't persist */
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', next === 'light' ? '#f4f1ea' : '#0d0d0f')
  listeners.forEach((l) => l())
}

export function getTheme(): Theme {
  return current
}

/** Flip themes, crossfading via the View Transitions API where available. */
export function toggleTheme(reduced: boolean) {
  const next: Theme = current === 'light' ? 'dark' : 'light'
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
  if (!reduced && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => apply(next))
  } else {
    apply(next)
  }
}

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
