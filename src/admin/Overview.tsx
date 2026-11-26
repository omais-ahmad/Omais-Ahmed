import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { formatDateTime } from '@/lib/format'
import { importBundledContent, loadOverview, type Overview as OverviewData } from './api'
import { Notice, type NoticeState } from './ui'

/** Dashboard home. Every number on this screen is counted from the database on load. */
export function Overview({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)

  const load = useCallback(async () => {
    setLoadError('')
    try {
      setData(await loadOverview())
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Loading failed.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runImport = async () => {
    setBusy(true)
    setNotice(null)
    try {
      await importBundledContent()
      setNotice({ kind: 'success', text: 'Bundled content imported. The site now reads from the database.' })
      await load()
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Import failed.' })
    } finally {
      setBusy(false)
    }
  }

  const stats = data
    ? [
        { label: 'Projects', value: data.counts.projects.total, detail: `${data.counts.projects.published} published`, section: 'projects' },
        { label: 'Skills', value: data.skills, detail: `in ${data.counts.skillCategories.total} categories`, section: 'skillCategories' },
        { label: 'Experience entries', value: data.counts.experience.total, detail: `${data.counts.experience.published} published`, section: 'experience' },
        { label: 'Contact messages', value: data.messages.total, detail: `${data.messages.unread} unread`, section: 'messages' },
      ]
    : []

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>Overview</h1>
          <p>The current state of the portfolio content.</p>
        </div>
        <button type="button" className="button button--ghost" onClick={() => void load()}>
          <Icon name="refresh" size={16} />
          Refresh
        </button>
      </header>
      <Notice state={notice} />

      {loadError && (
        <div className="admin-state" role="alert">
          <p>{loadError}</p>
          <p>If this is a new project, run supabase/migrations/0001_init.sql in the Supabase SQL editor first.</p>
        </div>
      )}
      {!data && !loadError && (
        <p className="admin-state" role="status">
          Loading…
        </p>
      )}

      {data && !data.initialized && (
        <div className="admin-callout">
          <h2>The database is empty</h2>
          <p>
            The public site is currently showing the content bundled with the code. Import that content to start editing
            it here. Nothing on the public site changes until you edit something.
          </p>
          <button type="button" className="button button--primary" disabled={busy} onClick={() => void runImport()}>
            {busy ? 'Importing…' : 'Import bundled content'}
          </button>
        </div>
      )}

      {data && (
        <>
          <ul className="stats">
            {stats.map((stat) => (
              <li key={stat.label}>
                <button type="button" className="stat" onClick={() => onNavigate(stat.section)}>
                  <span className="stat__value">{stat.value}</span>
                  <span className="stat__label">{stat.label}</span>
                  <span className="stat__detail">{stat.detail}</span>
                </button>
              </li>
            ))}
          </ul>

          <dl className="admin-facts">
            <div>
              <dt>Portfolio status</dt>
              <dd>
                <span className={`badge ${data.initialized ? 'badge--live' : 'badge--draft'}`}>
                  {data.initialized ? 'Live from database' : 'Bundled content'}
                </span>
              </dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{data.lastUpdated ? formatDateTime(data.lastUpdated) : 'Never'}</dd>
            </div>
            <div>
              <dt>Education · certifications</dt>
              <dd>
                {data.counts.education.total} · {data.counts.certifications.total}
              </dd>
            </div>
            <div>
              <dt>Expertise areas · highlights</dt>
              <dd>
                {data.counts.expertise.total} · {data.counts.achievements.total}
              </dd>
            </div>
          </dl>

          <p className="admin-note">
            Edits appear on the public site the next time it loads. The static HTML that search engines read is
            refreshed on the next deployment (in Netlify: Deploys → Trigger deploy, after larger changes).
          </p>
        </>
      )}
    </section>
  )
}
