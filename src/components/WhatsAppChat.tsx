import { useEffect, useId, useRef, useState } from 'react'
import { useContent } from '@/lib/content'
import { whatsappUrl } from '@/lib/format'
import { Icon } from './Icon'

const MAX_LENGTH = 1000

/**
 * Floating WhatsApp launcher. The visitor writes a message here, and the button opens
 * WhatsApp (the app on a phone, WhatsApp Web on a computer) on the owner's chat with that
 * message already typed. Nothing is sent from this site: the visitor presses send in WhatsApp.
 */
export function WhatsAppChat() {
  const { profile } = useContent()
  const firstName = profile.name.split(/\s+/)[0] ?? profile.name
  const greeting = `Hi ${firstName}, I came across your portfolio and would like to get in touch.`

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(greeting)
  const panelId = useId()
  const input = useRef<HTMLTextAreaElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const field = input.current
    if (field) {
      field.focus()
      field.setSelectionRange(field.value.length, field.value.length)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        launcher.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const href = whatsappUrl(profile.whatsapp, message)
  if (!href) return null

  return (
    <div className="whatsapp">
      {open && (
        <section id={panelId} className="whatsapp__panel" aria-label={`Message ${profile.name} on WhatsApp`}>
          <header className="whatsapp__head">
            <span className="whatsapp__avatar" aria-hidden="true">
              <Icon name="whatsapp" size={20} />
            </span>
            <div>
              <p className="whatsapp__name">{profile.name}</p>
              <p className="whatsapp__hint">Chat on WhatsApp</p>
            </div>
            <button type="button" className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>
              <Icon name="close" size={18} />
            </button>
          </header>

          <label className="whatsapp__label" htmlFor={`${panelId}-message`}>
            Your message
          </label>
          <textarea
            id={`${panelId}-message`}
            ref={input}
            rows={4}
            maxLength={MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <a className="button whatsapp__send" href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <Icon name="whatsapp" size={18} />
            Continue in WhatsApp
          </a>
          <p className="whatsapp__note">Opens WhatsApp with this message ready to send.</p>
        </section>
      )}

      <button
        type="button"
        ref={launcher}
        className="whatsapp__launcher"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? 'Close WhatsApp message' : `Message ${profile.name} on WhatsApp`}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? 'close' : 'whatsapp'} size={26} />
      </button>
    </div>
  )
}
