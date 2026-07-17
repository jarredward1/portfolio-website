import { useEffect, useState } from 'react'
import { site } from '../../data/site'
import { GitHubIcon, LinkedInIcon } from '../ui/Icons'
import s from './Nav.module.css'

const links = [
  { href: '#timeline', label: 'Timeline' },
  { href: '#projects', label: 'Projects' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={`container ${s.inner}`}>
        <a className={s.brand} href="#main" aria-label="Jarred Ward — back to top">
          <span className={s.tick} aria-hidden="true" />
          JW
        </a>
        <nav aria-label="Sections" className={s.links}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={s.link}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className={s.side}>
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
