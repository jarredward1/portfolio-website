import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { site } from '../../data/site'
import { getTheme, subscribeTheme, toggleTheme } from '../../theme'
import { GitHubIcon, LinkedInIcon, ThemeIcon } from '../ui/Icons'
import s from './Nav.module.css'

const links = [
  { id: 'timeline', href: '#timeline', label: 'Timeline' },
  { id: 'projects', href: '#projects', label: 'Projects' },
  { id: 'certifications', href: '#certifications', label: 'Certifications' },
  { id: 'contact', href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const reduced = useReducedMotion()
  const theme = useSyncExternalStore(subscribeTheme, getTheme)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const vis = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section currently crosses the middle of the viewport; a small
  // amber diamond slides under the matching link.
  useEffect(() => {
    const els = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) vis.current[e.target.id] = e.isIntersecting
        const current = links.find((l) => vis.current[l.id])
        setActive(current ? current.id : null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <header className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={`container ${s.inner}`}>
        <a className={s.brand} href="#main" aria-label="Jarred Ward, back to top">
          <span className={s.tick} aria-hidden="true" />
          JW
        </a>
        <nav aria-label="Sections" className={s.links}>
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className={`${s.link} ${active === l.id ? s.linkOn : ''}`}
              aria-current={active === l.id ? 'location' : undefined}
            >
              {l.label}
              {active === l.id ? (
                <motion.span
                  layoutId="nav-active-diamond"
                  className={s.activeDiamond}
                  aria-hidden="true"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 480, damping: 36 }
                  }
                />
              ) : null}
            </a>
          ))}
        </nav>
        <div className={s.side}>
          <button
            type="button"
            className={s.icon}
            onClick={() => toggleTheme(reduced ?? false)}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            <ThemeIcon size={17} />
          </button>
          <a
            className={s.icon}
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
          >
            <LinkedInIcon size={18} />
          </a>
          <a
            className={s.icon}
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <GitHubIcon size={18} />
          </a>
          <a className={s.resume} href={site.resumePath} download>
            Résumé
          </a>
        </div>
      </div>
    </header>
  )
}
