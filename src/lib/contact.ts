import { emailJsConfig, supabaseConfig } from './config'

export interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
  /** Honeypot: real visitors never see or fill this field. */
  website: string
}

export type ContactErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>

/** Limits mirror the checks in the submit_contact_message() database function. */
export const CONTACT_LIMITS = { name: 100, email: 254, subject: 150, messageMin: 10, messageMax: 4000 }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {}
  const name = input.name.trim()
  const email = input.email.trim()
  const subject = input.subject.trim()
  const message = input.message.trim()

  if (name.length < 2) errors.name = 'Please enter your name.'
  else if (name.length > CONTACT_LIMITS.name) errors.name = `Name must be ${CONTACT_LIMITS.name} characters or fewer.`

  if (!EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.email) {
    errors.email = 'Please enter a valid email address.'
  }

  if (subject.length < 2) errors.subject = 'Please add a subject.'
  else if (subject.length > CONTACT_LIMITS.subject) {
    errors.subject = `Subject must be ${CONTACT_LIMITS.subject} characters or fewer.`
  }

  if (message.length < CONTACT_LIMITS.messageMin) {
    errors.message = `Message must be at least ${CONTACT_LIMITS.messageMin} characters.`
  } else if (message.length > CONTACT_LIMITS.messageMax) {
    errors.message = `Message must be ${CONTACT_LIMITS.messageMax} characters or fewer.`
  }
  return errors
}

export class ContactError extends Error {
  constructor(
    message: string,
    readonly code: 'rate_limited' | 'invalid' | 'unavailable',
  ) {
    super(message)
    this.name = 'ContactError'
  }
}

const SERVER_MESSAGES: Record<string, { code: ContactError['code']; text: string }> = {
  rate_limited: {
    code: 'rate_limited',
    text: 'Too many messages have been sent recently. Please try again later or email me directly.',
  },
  invalid_name: { code: 'invalid', text: 'Please check your name and try again.' },
  invalid_email: { code: 'invalid', text: 'Please check your email address and try again.' },
  invalid_subject: { code: 'invalid', text: 'Please check the subject and try again.' },
  invalid_message: { code: 'invalid', text: 'Please check your message and try again.' },
}

/** Stores the message through the validated, rate-limited database function. */
async function storeMessage(input: ContactInput): Promise<void> {
  if (!supabaseConfig) return
  const { url, anonKey } = supabaseConfig
  const response = await fetch(`${url}/rest/v1/rpc/submit_contact_message`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_name: input.name,
      p_email: input.email,
      p_subject: input.subject,
      p_message: input.message,
      p_website: input.website,
    }),
  })
  if (!response.ok) throw new ContactError('The message service is unavailable right now.', 'unavailable')
  const result = (await response.json()) as { ok?: boolean; error?: string }
  if (!result.ok) {
    const known = SERVER_MESSAGES[result.error ?? '']
    throw new ContactError(known?.text ?? 'The message could not be sent.', known?.code ?? 'unavailable')
  }
}

/** Sends the email notification through EmailJS. */
async function sendEmail(input: ContactInput): Promise<void> {
  const { publicKey, serviceId, templateId } = emailJsConfig
  if (!publicKey || !serviceId || !templateId) throw new Error('EmailJS is not configured')
  const { default: emailjs } = await import('@emailjs/browser')
  await emailjs.send(
    serviceId,
    templateId,
    {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      // The stock EmailJS "Contact Us" template body reads these two.
      title: input.subject,
      time: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    { publicKey, limitRate: { id: 'portfolio-contact', throttle: 20_000 } },
  )
}

/**
 * Delivers a contact message. Resolves only when the message was really stored and/or
 * emailed; every failure rejects with a ContactError so the form can say so.
 *
 * With Supabase configured the database function is the gate: it validates, rate-limits
 * and stores the message, and the email is a best-effort notification on top.
 * Without Supabase, EmailJS is the only delivery channel and its failure is a failure.
 */
export async function submitContact(raw: ContactInput): Promise<void> {
  const input: ContactInput = {
    name: raw.name.trim(),
    email: raw.email.trim(),
    subject: raw.subject.trim(),
    message: raw.message.trim(),
    website: raw.website,
  }
  if (Object.keys(validateContact(input)).length > 0) {
    throw new ContactError('Please correct the highlighted fields.', 'invalid')
  }
  // A filled honeypot is a bot. Nothing is sent, and the bot gets no signal to adapt to.
  if (input.website.trim() !== '') return

  if (supabaseConfig) {
    await storeMessage(input)
    try {
      await sendEmail(input)
    } catch (error) {
      console.warn('Message stored, but the email notification failed.', error)
    }
    return
  }

  try {
    await sendEmail(input)
  } catch (error) {
    const status = (error as { status?: number } | null)?.status
    if (status === 429) {
      throw new ContactError('Please wait a moment before sending another message.', 'rate_limited')
    }
    throw new ContactError('The message could not be sent. Please email me directly instead.', 'unavailable')
  }
}
