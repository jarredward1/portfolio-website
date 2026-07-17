import { motion, useReducedMotion } from 'motion/react'
import { site } from '../../data/site'
import { GitHubIcon, LinkedInIcon, ArrowUpRight } from '../ui/Icons'
import s from './Contact.module.css'

export default function Contact() {
  const reduced = useReducedMotion()

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <motion.div
          className={s.wrap}
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mono-label">Contact</p>
          <h2 id="contact-title" className={s.headline}>
            Open to GRC and vulnerability-management roles.
          </h2>
          <p className={s.sub}>
            Based in the Atlanta metro. The fastest way to reach me is email — or connect on
            LinkedIn.
          </p>

          <a className={s.email} href={`mailto:${site.email}`}>
            <span className={s.emailText}>{site.email}</span>
            <ArrowUpRight size={22} />
          </a>

          <div className={s.socials}>
            <a
              className={s.social}
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon size={19} />
              LinkedIn
            </a>
            <a className={s.social} href={site.github} target="_blank" rel="noreferrer">
              <GitHubIcon size={19} />
              GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
