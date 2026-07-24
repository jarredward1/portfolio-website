// functions/api/contact.ts
//
// Cloudflare Pages Function — POST /api/contact
//
// Receives the Contact section's form submission, validates it server-side
// (the client's HTML5 validation is a UX nicety, not a security boundary),
// and relays it to Jarred's inbox via the Resend API. Runs in the Workers
// runtime, not Node: secrets come from `context.env`, never `process.env`
// (doesn't exist here) and never `import.meta.env` (Vite-client-only, would
// leak into the public bundle).

import { site } from '../../src/data/site'

export interface Env {
  RESEND_API_KEY: string
}

interface ContactPayload {
  name: string
  email: string
  message: string
  /** Honeypot: a real visitor never populates this (hidden off-screen, not
   *  display:none/type=hidden — see Contact.module.css's `.hp`). Any value
   *  here means a bot filled every field it could see in the DOM. */
  company: string
}

interface ContactResult {
  ok: boolean
  error?: string
}

const NAME_MAX = 100
const EMAIL_MAX = 254 // RFC 5321 mailbox length ceiling
const MESSAGE_MAX = 5000

// A sanity check, not an RFC 5322 validator. Mutually exclusive character
// classes keep it linear-time — no catastrophic-backtracking risk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(body: ContactResult, status: number): Response {
  return Response.json(body, { status })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return json({ ok: false, error: 'Malformed request body.' }, 400)
  }
  if (typeof raw !== 'object' || raw === null) {
    return json({ ok: false, error: 'Malformed request body.' }, 400)
  }
  const payload = raw as Partial<ContactPayload>

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  const company = typeof payload.company === 'string' ? payload.company.trim() : ''

  // Honeypot short-circuit: identical success shape a real sender gets,
  // before inspecting (or leaking anything about) the rest of the payload.
  if (company !== '') {
    return json({ ok: true }, 200)
  }

  if (!name || !email || !message) {
    return json({ ok: false, error: 'Name, email, and message are all required.' }, 400)
  }
  if (name.length > NAME_MAX || email.length > EMAIL_MAX || message.length > MESSAGE_MAX) {
    return json({ ok: false, error: 'One or more fields is too long.' }, 400)
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'That email address does not look valid.' }, 400)
  }
  // `name` is interpolated into the email subject below. Reject rather than
  // silently strip — cheap defense against header-shaped content riding
  // along in a field a mail client might render unexpectedly.
  if (/[\r\n]/.test(name)) {
    return json({ ok: false, error: 'Name contains invalid characters.' }, 400)
  }

  if (!env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not configured in this environment.')
    return json({ ok: false, error: 'Email delivery is not configured yet.' }, 500)
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <contact@jarredward.tech>',
        to: [site.email],
        reply_to: email,
        subject: `New portfolio message from ${name}`,
        text: `${message}\n\n—\n${name} <${email}>`,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[contact] Resend responded ${res.status}: ${detail}`)
      return json({ ok: false, error: 'Could not send your message right now.' }, 500)
    }

    return json({ ok: true }, 200)
  } catch (err) {
    console.error('[contact] Resend request failed:', err)
    return json({ ok: false, error: 'Could not send your message right now.' }, 500)
  }
}
