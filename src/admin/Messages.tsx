import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { formatDateTime } from '@/lib/format'
import { deleteMessage, listMessages, setMessageStatus, type ContactMessage, type MessageStatus } from './api'
import { Notice, type NoticeState } from './ui'

const FILTERS: { value: MessageStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
]

/** Inbox for messages submitted through the public contact form. */
export function Messages() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [filter, setFilter] = useState<MessageStatus | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState<NoticeState>(null)

  const load = useCallback(async () => {
    setLoadError('')
    try {
      setMessages(await listMessages())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Loading failed.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const changeStatus = async (message: ContactMessage, status: MessageStatus) => {
    setNotice(null)
    try {
      await setMessageStatus(message.id, status)
      setMessages((current) => current?.map((item) => (item.id === message.id ? { ...item, status } : item)) ?? null)
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Updating failed.' })
    }
  }

  const toggle = (message: ContactMessage) => {
    const opening = openId !== message.id
    setOpenId(opening ? message.id : null)
    if (opening && message.status === 'new') void changeStatus(message, 'read')
  }

  const remove = async (message: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return
    setNotice(null)
    try {
      await deleteMessage(message.id)
      setMessages((current) => current?.filter((item) => item.id !== message.id) ?? null)
      setNotice({ kind: 'success', text: 'Message deleted.' })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Deleting failed.' })
    }
  }

  const visible = messages?.filter((message) => filter === 'all' || message.status === filter) ?? []

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Messages</h1>
          <p>Messages sent through the contact form.</p>
        </div>
        <button type="button" className="button button--ghost" onClick={() => void load()}>
          <Icon name="refresh" size={16} />
          Refresh
        </button>
      </header>
      <Notice state={notice} />

      <div className="filters" role="group" aria-label="Filter messages">
        {FILTERS.map((option) => (
          <button key={option.value} type="button" className={`filter${filter === option.value ? ' is-active' : ''}`} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>
            {option.label}
            {messages && option.value !== 'all' && ` (${messages.filter((message) => message.status === option.value).length})`}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="admin-state" role="alert">
          <p>{loadError}</p>
          <button type="button" className="button button--ghost button--small" onClick={() => void load()}>
            Try again
          </button>
        </div>
      )}
      {!messages && !loadError && (
        <p className="admin-state" role="status">
          Loading…
        </p>
      )}
      {messages && visible.length === 0 && <p className="admin-state">{messages.length === 0 ? 'No messages yet.' : 'No messages match this filter.'}</p>}

      <ul className="rows">
        {visible.map((message) => {
          const open = openId === message.id
          return (
            <li className={`message${message.status === 'new' ? ' is-new' : ''}`} key={message.id}>
              <button type="button" className="message__summary" aria-expanded={open} onClick={() => toggle(message)}>
                <span className="message__from">
                  {message.status === 'new' && <span className="status-dot" aria-label="Unread" />}
                  {message.name}
                </span>
                <span className="message__subject">{message.subject}</span>
                <span className="message__date">{formatDateTime(message.created_at)}</span>
              </button>
              {open && (
                <div className="message__body">
                  <p className="message__email">
                    <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>{message.email}</a>
                  </p>
                  {/* Rendered as text, never as HTML: message content is untrusted input. */}
                  <p className="message__text">{message.message}</p>
                  <div className="row__actions">
                    <a className="button button--primary button--small" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>
                      <Icon name="mail" size={15} /> Reply by email
                    </a>
                    {message.status !== 'new' && (
                      <button type="button" className="button button--ghost button--small" onClick={() => void changeStatus(message, 'new')}>
                        Mark unread
                      </button>
                    )}
                    {message.status !== 'archived' ? (
                      <button type="button" className="button button--ghost button--small" onClick={() => void changeStatus(message, 'archived')}>
                        Archive
                      </button>
                    ) : (
                      <button type="button" className="button button--ghost button--small" onClick={() => void changeStatus(message, 'read')}>
                        Unarchive
                      </button>
                    )}
                    <button type="button" className="button button--danger button--small" onClick={() => void remove(message)}>
                      <Icon name="trash" size={15} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
