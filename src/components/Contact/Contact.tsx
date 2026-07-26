import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { site } from '../../data/site'
import {
  GitHubIcon,
  LinkedInIcon,
  ArrowUpRight,
  SendIcon,
  CheckIcon,
  SpinnerIcon,
  AlertIcon,
} from '../ui/Icons'
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

type Status = 'idle' | 'submitting' | 'success' | 'error'

const MESSAGE_MAX = 5000

function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const controller = useRef<AbortController | null>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => controller.current?.abort(), [])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    setStatus('submitting')
    setErrorMessage('')
    controller.current?.abort()
    controller.current = new AbortController()

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          company: data.get('company'),
        }),
        signal: controller.current.signal,
      })

      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!res.ok || !payload?.ok) {
        setErrorMessage(payload?.error ?? 'Something went wrong. Please try again or email me directly.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setErrorMessage('Network error. Please try again or email me directly.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={s.success} role="status" tabIndex={-1} ref={successRef}>
        <CheckIcon size={22} className={s.successIcon} />
        <div>
          <p className={s.successText}>
            Message sent. Thanks for reaching out. I'll reply to your email directly.
          </p>
          <button type="button" className={s.resetLink} onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} aria-labelledby="contact-title">
      {status === 'error' && (
        <p className={s.formError} role="alert">
          <AlertIcon size={16} />
          {errorMessage}
        </p>
      )}

      <div className={s.fields}>
        <div className={s.field}>
          <label htmlFor="contact-name" className={`mono-label ${s.label}`}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            className={s.input}
          />
        </div>

        <div className={s.field}>
          <label htmlFor="contact-email" className={`mono-label ${s.label}`}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={s.input}
          />
        </div>

        <div className={`${s.field} ${s.fieldMessage}`}>
          <label htmlFor="contact-message" className={`mono-label ${s.label}`}>
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={MESSAGE_MAX}
            rows={5}
            className={s.textarea}
          />
        </div>
      </div>

      {/* Honeypot: hidden from sighted and AT users via off-screen absolute
          positioning — never display:none/visibility:hidden/opacity:0 (some
          scraping bots check computed visibility and skip those) and never
          type="hidden" (some bots skip that too). aria-hidden removes it from
          the accessibility tree; tabIndex={-1} keeps it out of tab order. */}
      <div className={s.hp} aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className={s.submit} disabled={status === 'submitting'}>
        {status === 'submitting' ? <SpinnerIcon size={16} className={s.spinnerIcon} /> : <SendIcon size={16} />}
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

export default function Contact() {
  const reduced = useReducedMotion()

  return (
    <section id="contact" className={`section ${s.section}`} aria-labelledby="contact-title">
      <div className={`${s.aurora} no-print`} aria-hidden="true" />
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
            Open to GRC and vulnerability management roles.
          </h2>
          <p className={s.sub}>Send a message below, or email me directly.</p>

          <ContactForm />

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
