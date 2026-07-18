import { motion, useReducedMotion } from 'motion/react'
import { site } from '../../data/site'
import { GitHubIcon, LinkedInIcon } from '../ui/Icons'
import s from './Footer.module.css'

export default function Footer() {
  const reduced = useReducedMotion() ?? false
  const year = new Date().getFullYear()
  const view = { once: true, margin: '-30px' } as const

  return (
    <footer className={s.footer}>
      {/* End-of-file sign-off: the rule sweeps closed, the JW diamond draws
          itself, and the record ends. */}
      <div className={`container ${s.signoff}`}>
        <motion.div
          className={s.signRule}
          aria-hidden="true"
          initial={{ scaleX: reduced ? 1 : 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={view}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <svg className={s.signMark} viewBox="0 0 24 24" aria-hidden="true">
          <motion.path
            d="M12 2.5 21.5 12 12 21.5 2.5 12Z"
            fill="none"
            initial={{ pathLength: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={view}
            transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <motion.p
          className={s.signText}
          initial={{ opacity: reduced ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={view}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          {'// end of record'}
        </motion.p>
      </div>

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
