import { useId, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { safeExternalUrl, whatsappUrl } from '@/lib/format'
import { useContent } from '@/lib/content'
import {
  CONTACT_LIMITS,
  ContactError,
  submitContact,
  validateContact,
  type ContactErrors,
  type ContactInput,
} from '@/lib/contact'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

const EMPTY: ContactInput = { name: '', email: '', subject: '', message: '', website: '' }

export function Contact({ index }: { index: string }) {
  const { profile, settings, hero, socialLinks } = useContent()
  const [values, setValues] = useState<ContactInput>(EMPTY)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)
  const uid = useId()

  const update = (field: keyof ContactInput) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    if (field !== 'website' && errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (status.kind === 'sending') return
    const found = validateContact(values)
    setErrors(found)
    const firstInvalid = (Object.keys(found) as (keyof ContactErrors)[])[0]
    if (firstInvalid) {
      setStatus({ kind: 'idle' })
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    try {
      await submitContact(values)
      setValues(EMPTY)
      setStatus({ kind: 'sent' })
    } catch (error) {
      const message =
        error instanceof ContactError ? error.message : 'The message could not be sent. Please email me directly instead.'
      setStatus({ kind: 'error', message })
    }
  }

  const field = (name: 'name' | 'email' | 'subject', label: string, type: string, autoComplete: string, maxLength: number) => (
    <div className={`field${errors[name] ? ' has-error' : ''}`}>
      <label htmlFor={`${uid}-${name}`}>{label}</label>
      <input
        id={`${uid}-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={values[name]}
        onChange={update(name)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${uid}-${name}-error` : undefined}
        required
      />
      {errors[name] && (
        <p className="field__error" id={`${uid}-${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <Section id="contact" index={index} eyebrow="Contact" title={settings.contactHeading} lead={settings.contactIntro}>
      <div className="contact">
        <Reveal className="contact__info">
          {hero.status && (
            <p className="pill pill--live">
              <span className="status-dot" aria-hidden="true" />
              {hero.status}
            </p>
          )}
          <ul className="contact__list">
            <li>
              <a className="contact-card" href={`mailto:${profile.email}`}>
                <span className="contact-card__icon">
                  <Icon name="mail" />
                </span>
                <span className="contact-card__text">
                  <span>Email</span>
                  <strong>{profile.email}</strong>
                </span>
                <Icon name="arrow-up-right" size={16} />
              </a>
            </li>
            {profile.showPhone && profile.phone && (
              <li>
                <a className="contact-card" href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>
                  <span className="contact-card__icon">
                    <Icon name="phone" />
                  </span>
                  <span className="contact-card__text">
                    <span>Phone</span>
                    <strong>{profile.phone}</strong>
                  </span>
                  <Icon name="arrow-up-right" size={16} />
                </a>
              </li>
            )}
            {whatsappUrl(profile.whatsapp) && (
              <li>
                <a
                  className="contact-card"
                  href={whatsappUrl(profile.whatsapp, `Hi ${profile.name.split(/\s+/)[0]}, I came across your portfolio and would like to get in touch.`) ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="contact-card__icon">
                    <Icon name="whatsapp" />
                  </span>
                  <span className="contact-card__text">
                    <span>WhatsApp</span>
                    <strong>Message me on WhatsApp</strong>
                  </span>
                  <Icon name="arrow-up-right" size={16} />
                </a>
              </li>
            )}
            {socialLinks
              .filter((link) => link.icon !== 'email')
              .map((link) => {
                const href = safeExternalUrl(link.url)
                if (!href) return null
                return (
                  <li key={link.id}>
                    <a className="contact-card" href={href} target="_blank" rel="noopener noreferrer">
                      <span className="contact-card__icon">
                        <Icon name={link.icon === 'github' || link.icon === 'linkedin' ? link.icon : 'link'} />
                      </span>
                      <span className="contact-card__text">
                        <span>{link.label}</span>
                        <strong>{href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</strong>
                      </span>
                      <Icon name="arrow-up-right" size={16} />
                    </a>
                  </li>
                )
              })}
            <li>
              <div className="contact-card">
                <span className="contact-card__icon">
                  <Icon name="map-pin" />
                </span>
                <span className="contact-card__text">
                  <span>Location</span>
                  <strong>{profile.location}</strong>
                </span>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal order={1} className="form-panel">
          <div className="form-panel__bar" aria-hidden="true">
            <span>
              <span className="status-dot" />
              contact://new-message
            </span>
            <span>validated · spam-protected</span>
          </div>
          <form className="form" ref={formRef} onSubmit={onSubmit} noValidate aria-label="Contact form">
            <div className="form__row">
              {field('name', 'Name', 'text', 'name', CONTACT_LIMITS.name)}
              {field('email', 'Email', 'email', 'email', CONTACT_LIMITS.email)}
            </div>
            {field('subject', 'Subject', 'text', 'off', CONTACT_LIMITS.subject)}

            <div className={`field${errors.message ? ' has-error' : ''}`}>
              <label htmlFor={`${uid}-message`}>Message</label>
              <textarea
                id={`${uid}-message`}
                name="message"
                rows={6}
                maxLength={CONTACT_LIMITS.messageMax}
                value={values.message}
                onChange={update('message')}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                required
              />
              {errors.message && (
                <p className="field__error" id={`${uid}-message-error`}>
                  {errors.message}
                </p>
              )}
            </div>

            {/* Honeypot: hidden from people and assistive technology, tempting to bots. */}
            <div className="form__trap" aria-hidden="true">
              <label htmlFor={`${uid}-website`}>Website</label>
              <input
                id={`${uid}-website`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={update('website')}
              />
            </div>

            <div className="form__footer">
              <button type="submit" className="button button--primary" disabled={status.kind === 'sending'}>
                {status.kind === 'sending' ? 'Sending…' : 'Send message'}
                {status.kind !== 'sending' && <Icon name="arrow-right" size={16} />}
              </button>
              <p className={`form__status form__status--${status.kind}`} role="status" aria-live="polite">
                {status.kind === 'sent' && (
                  <>
                    <Icon name="check" size={16} /> Message sent. I will reply by email.
                  </>
                )}
                {status.kind === 'error' && (
                  <>
                    <Icon name="alert" size={16} /> {status.message}
                  </>
                )}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  )
}
