import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { site } from '../../data/site'
import { GitHubIcon, LinkedInIcon, ArrowUpRight } from '../ui/Icons'
import s from './Contact.module.css'

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard unavailable (permissions/insecure context): quietly no-op,
      // the mailto link remains the primary path.
    }
  }

  return (
    <button
      type="button"
      className={`${s.copy} ${copied ? s.copied : ''}`}
      onClick={copy}
      aria-live="polite"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function Contact() {
  const reduced = useReducedMotion()

  return (
    <section id="contact" className={`section ${s.section}`} aria-labelledby="contact-title">
      <div className={s.aurora} aria-hidden="true" />
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
          <p className={s.sub}>Email is the fastest way to reach me, or connect on LinkedIn.</p>

          <div className={s.emailRow}>
            <a className={s.email} href={`mailto:${site.email}`}>
              <span className={s.emailText}>{site.email}</span>
              <ArrowUpRight size={22} />
            </a>
            <CopyEmail />
          </div>

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
