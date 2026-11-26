import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Icon } from '@/components/Icon'
import type { Profile } from '@/content/types'
import { assetUrl } from '@/lib/config'
import { loadSingleton, removeUploadedFile, saveSingleton, UPLOAD_RULES, uploadFile } from './api'
import { Notice, type NoticeState } from './ui'

/** Upload, replace or remove the CV behind the "Download CV" buttons. */
export function CvManager() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSingleton('profile')
      .then(setProfile)
      .catch((error: unknown) => setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Loading failed.' }))
  }, [])

  /** Saves the new CV location, then removes the file it replaced. */
  const commit = async (cvUrl: string, success: string) => {
    if (!profile) return
    const previous = profile.cvUrl
    const next = { ...profile, cvUrl }
    await saveSingleton('profile', next)
    setProfile(next)
    setNotice({ kind: 'success', text: success })
    if (previous && previous !== cvUrl) await removeUploadedFile(previous).catch(() => undefined)
  }

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setNotice(null)
    try {
      const url = await uploadFile(file, 'pdf', 'cv')
      await commit(url, 'CV uploaded. The download buttons now point to the new file.')
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Upload failed.' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Remove the CV? The download buttons will disappear from the site.')) return
    setBusy(true)
    setNotice(null)
    try {
      await commit('', 'CV removed. The download buttons are hidden.')
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Removing failed.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>CV</h1>
          <p>The English CV offered by the “Download CV” buttons.</p>
        </div>
      </header>
      <Notice state={notice} />

      {!profile && !notice && (
        <p className="admin-state" role="status">
          Loading…
        </p>
      )}
      {profile && (
        <div className="admin-callout">
          <h2>{profile.cvUrl ? 'Current CV' : 'No CV is published'}</h2>
          {profile.cvUrl ? (
            <p>
              <a className="link-pill" href={assetUrl(profile.cvUrl)} target="_blank" rel="noopener noreferrer">
                Open the current file <Icon name="arrow-up-right" size={14} />
              </a>
            </p>
          ) : (
            <p>Upload a PDF to show the download buttons in the header and hero.</p>
          )}
          <input ref={input} type="file" accept={UPLOAD_RULES.pdf.types.join(',')} hidden onChange={onFile} aria-label="Choose a CV file" />
          <div className="row__actions">
            <button type="button" className="button button--primary" disabled={busy} onClick={() => input.current?.click()}>
              <Icon name="upload" size={16} />
              {busy ? 'Working…' : profile.cvUrl ? 'Replace CV' : 'Upload CV'}
            </button>
            {profile.cvUrl && (
              <button type="button" className="button button--danger" disabled={busy} onClick={() => void remove()}>
                <Icon name="trash" size={16} />
                Remove CV
              </button>
            )}
          </div>
          <p className="field__help">{UPLOAD_RULES.pdf.label}.</p>
        </div>
      )}
    </section>
  )
}
