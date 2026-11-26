import './admin.css'

import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon, type IconName } from '@/components/Icon'
import { supabaseConfig } from '@/lib/config'
import { checkIsAdmin, supabase } from './api'
import { CollectionManager } from './CollectionManager'
import { CvManager } from './CvManager'
import { Messages } from './Messages'
import { Overview } from './Overview'
import { COLLECTIONS, SINGLETONS } from './schemas'
import { SingletonEditor } from './SingletonEditor'

interface NavItem {
  id: string
  label: string
  icon: IconName
}

const collection = (key: string) => COLLECTIONS.find((config) => config.key === key)
const singleton = (key: string) => SINGLETONS.find((config) => config.key === key)

const NAV: { heading: string; items: NavItem[] }[] = [
  { heading: 'Dashboard', items: [{ id: 'overview', label: 'Overview', icon: 'grid' }] },
  {
    heading: 'Content',
    items: [
      { id: 'profile', label: 'Profile', icon: 'edit' },
      { id: 'hero', label: 'Hero', icon: 'edit' },
      { id: 'about', label: 'About', icon: 'edit' },
      { id: 'experience', label: 'Experience', icon: 'layers' },
      { id: 'projects', label: 'Projects', icon: 'layers' },
      { id: 'skillCategories', label: 'Skills', icon: 'layers' },
      { id: 'expertise', label: 'Expertise', icon: 'layers' },
      { id: 'education', label: 'Education', icon: 'layers' },
      { id: 'certifications', label: 'Certifications', icon: 'layers' },
      { id: 'achievements', label: 'Highlights', icon: 'layers' },
      { id: 'languages', label: 'Languages', icon: 'layers' },
      { id: 'socialLinks', label: 'Social links', icon: 'link' },
      { id: 'cv', label: 'CV', icon: 'download' },
    ],
  },
  { heading: 'Inbox', items: [{ id: 'messages', label: 'Messages', icon: 'inbox' }] },
  {
    heading: 'Site',
    items: [
      { id: 'seo', label: 'SEO', icon: 'edit' },
      { id: 'settings', label: 'Settings', icon: 'edit' },
    ],
  },
]

/** Shown when the build has no Supabase configuration. There is deliberately no login form here. */
function SetupNotice() {
  return (
    <main className="admin-gate">
      <div className="admin-card">
        <p className="eyebrow">
          <span className="eyebrow__index">Admin</span>Setup required
        </p>
        <h1>The dashboard is not connected yet.</h1>
        <p>
          This build has no backend configured, so there is nothing to sign in to. The public site is running from the
          content bundled with the code.
        </p>
        <ol className="admin-steps">
          <li>Create a Supabase project.</li>
          <li>
            Run <code>supabase/migrations/0001_init.sql</code> in its SQL editor.
          </li>
          <li>Create your user under Authentication and add it to the <code>admins</code> table (the script explains how).</li>
          <li>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then rebuild and deploy.
          </li>
        </ol>
        <p>The full steps are in README.md.</p>
        <Link to="/" className="button button--ghost">
          <Icon name="arrow-left" size={16} />
          Back to the site
        </Link>
      </div>
    </main>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error: signInError } = await supabase().auth.signInWithPassword({ email: email.trim(), password })
    // One message for every failure, so the form does not reveal which accounts exist.
    if (signInError) setError('Sign-in failed. Check your email and password.')
    setBusy(false)
  }

  return (
    <main className="admin-gate">
      <form className="admin-card" onSubmit={submit}>
        <p className="eyebrow">
          <span className="eyebrow__index">Admin</span>Sign in
        </p>
        <h1>Portfolio dashboard</h1>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        {error && (
          <p className="notice notice--error" role="alert">
            <Icon name="alert" size={16} />
            {error}
          </p>
        )}
        <button type="submit" className="button button--primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <Link to="/" className="admin-card__back">
          Back to the site
        </Link>
      </form>
    </main>
  )
}

function Dashboard({ session }: { session: Session }) {
  const [params, setParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const section = params.get('section') ?? 'overview'
  const navigate = (id: string) => {
    setParams(id === 'overview' ? {} : { section: id })
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const collectionConfig = collection(section)
  const singletonConfig = singleton(section)

  return (
    <div className="admin">
      <aside className={`admin__sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="admin__brand">
          <span className="brand__mark" aria-hidden="true">
            OA
          </span>
          <span>Portfolio admin</span>
          <button type="button" className="icon-button admin__menu" aria-expanded={menuOpen} aria-controls="admin-nav" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
        <nav id="admin-nav" className="admin__nav" aria-label="Admin sections">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="admin__nav-heading">{group.heading}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" className={`admin__nav-link${section === item.id ? ' is-active' : ''}`} aria-current={section === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}>
                      <Icon name={item.icon} size={16} />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="admin__account">
          <p title={session.user.email}>{session.user.email}</p>
          <a className="button button--ghost button--small" href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer">
            View site <Icon name="arrow-up-right" size={14} />
          </a>
          <button type="button" className="button button--ghost button--small" onClick={() => void supabase().auth.signOut()}>
            <Icon name="logout" size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin__main">
        {section === 'overview' && <Overview onNavigate={navigate} />}
        {section === 'messages' && <Messages />}
        {section === 'cv' && <CvManager />}
        {collectionConfig && <CollectionManager key={collectionConfig.key} config={collectionConfig} />}
        {singletonConfig && <SingletonEditor key={singletonConfig.key} config={singletonConfig} />}
        {!collectionConfig && !singletonConfig && !['overview', 'messages', 'cv'].includes(section) && (
          <p className="admin-state">This section does not exist.</p>
        )}
      </main>
    </div>
  )
}

type Access = 'checking' | 'granted' | 'denied' | 'error'

/**
 * Entry point of the dashboard.
 *
 * What is shown here is a convenience, not the security boundary: every read and write
 * goes through row level security in the database, which checks the signed-in user against
 * the admins table. A visitor who forces this UI open still cannot read or change anything.
 */
export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [access, setAccess] = useState<Access>('checking')
  const userId = session?.user.id

  useEffect(() => {
    if (!supabaseConfig) return
    const auth = supabase().auth
    void auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setAccess('checking')
    checkIsAdmin()
      .then((isAdmin) => !cancelled && setAccess(isAdmin ? 'granted' : 'denied'))
      .catch(() => !cancelled && setAccess('error'))
    return () => {
      cancelled = true
    }
  }, [userId])

  if (!supabaseConfig) return <SetupNotice />
  if (session === undefined) return <div className="admin-loading" role="status">Checking your session…</div>
  if (!session) return <Login />
  if (access === 'checking') return <div className="admin-loading" role="status">Checking permissions…</div>

  if (access !== 'granted') {
    return (
      <main className="admin-gate">
        <div className="admin-card" role="alert">
          <h1>{access === 'denied' ? 'This account is not an administrator.' : 'Permissions could not be checked.'}</h1>
          <p>
            {access === 'denied'
              ? 'You are signed in, but this account is not listed in the admins table, so the database will not let it read or change anything.'
              : 'The database did not answer. Check that the migration has been run, then try again.'}
          </p>
          <button type="button" className="button button--ghost" onClick={() => void supabase().auth.signOut()}>
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </div>
      </main>
    )
  }

  return <Dashboard session={session} />
}
