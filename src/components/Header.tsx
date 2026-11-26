import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import type { SectionId } from '@/content/types'
import { assetUrl } from '@/lib/config'
import { useContent } from '@/lib/content'
import { useActiveSection, useScrollLock, useTheme } from '@/lib/hooks'
import { Icon } from './Icon'

const NAV: { id: SectionId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export function Header() {
  const { profile, settings, hero } = useContent()
  const progress = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const [theme, toggleTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const items = NAV.filter((item) => settings.sections[item.id])
  const onHome = pathname === '/'
  const active = useActiveSection(
    items.map((item) => item.id),
    onHome,
  )
  useScrollLock(open)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      // Written straight to the element: a scroll position is not worth a render.
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      progress.current?.style.setProperty('--progress', scrollable > 0 ? String(Math.min(window.scrollY / scrollable, 1)) : '0')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const links = items.map((item, position) => (
    <li key={item.id}>
      <Link
        to={{ pathname: '/', hash: `#${item.id}` }}
        className={`nav__link${active === item.id ? ' is-active' : ''}`}
        aria-current={active === item.id ? 'location' : undefined}
        onClick={() => setOpen(false)}
      >
        <span className="nav__index" aria-hidden="true">
          {String(position + 1).padStart(2, '0')}
        </span>
        {item.label}
      </Link>
    </li>
  ))

  return (
    <header className={`header${scrolled || open ? ' is-scrolled' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="header__progress" ref={progress} aria-hidden="true" />
      <div className="container header__inner">
        <Link to="/" className="brand" aria-label={`${profile.name}, home`} onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true">
            {initials}
          </span>
          <span className="brand__name">{profile.name}</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <ul className="nav__list">{links}</ul>
        </nav>

        <div className="header__actions">
          {hero.status && (
            <span className="pill pill--live pill--small header__status" title={hero.status}>
              <span className="status-dot" aria-hidden="true" />
              available
            </span>
          )}
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          {profile.cvUrl && (
            <a className="button button--ghost button--small header__cv" href={assetUrl(profile.cvUrl)} download>
              <Icon name="download" size={16} />
              CV
            </a>
          )}
          <button
            type="button"
            className="icon-button header__menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav className="container" aria-label="Mobile">
          <ul className="mobile-menu__list">{links}</ul>
          {profile.cvUrl && (
            <a className="button button--primary" href={assetUrl(profile.cvUrl)} download>
              <Icon name="download" size={16} />
              Download CV
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
