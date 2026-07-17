import { site } from '../../data/site'
import { GitHubIcon, LinkedInIcon } from '../ui/Icons'
import s from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={s.footer}>
      <div className={`container ${s.inner}`}>
        <div className={s.left}>
          <span className={s.tick} aria-hidden="true" />
          <span className={s.name}>Jarred Ward</span>
          <span className={s.sep} aria-hidden="true">
            /
          </span>
          <span className={s.role}>{site.location}</span>
        </div>

        <div className={s.right}>
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
          <span className={s.copy}>© {year}</span>
        </div>
      </div>
    </footer>
  )
}
