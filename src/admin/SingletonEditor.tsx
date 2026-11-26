import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Icon } from '@/components/Icon'
import type { Singletons } from '@/content/types'
import { loadSingleton, saveSingleton } from './api'
import { FormFields } from './FormFields'
import { validateFields, type FieldErrors, type SingletonConfig } from './schemas'
import { Notice, type NoticeState } from './ui'

type Value = Record<string, unknown>

/** Edits one single-instance section (profile, hero, about, SEO, settings). */
export function SingletonEditor({ config }: { config: SingletonConfig }) {
  const [value, setValue] = useState<Value | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    setLoadError('')
    setValue(null)
    try {
      setValue((await loadSingleton(config.key)) as unknown as Value)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Loading failed.')
    }
  }, [config.key])

  useEffect(() => {
    setNotice(null)
    setErrors({})
    void load()
  }, [load])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!value) return
    const found = validateFields(config.fields, value)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setNotice({ kind: 'error', text: 'Please correct the highlighted fields.' })
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      await saveSingleton(config.key, value as unknown as Singletons[typeof config.key])
      setNotice({ kind: 'success', text: 'Saved. The public site shows the change on its next load.' })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Saving failed.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="editor" onSubmit={save} noValidate>
      <header className="admin-head">
        <div>
          <h1>{config.label}</h1>
          <p>{config.description}</p>
        </div>
      </header>
      <Notice state={notice} />

      {loadError && (
        <div className="admin-state" role="alert">
          <p>{loadError}</p>
          <button type="button" className="button button--ghost button--small" onClick={() => void load()}>
            <Icon name="refresh" size={15} /> Try again
          </button>
        </div>
      )}
      {!value && !loadError && (
        <p className="admin-state" role="status">
          Loading…
        </p>
      )}
      {value && (
        <>
          <div className="editor__fields">
            <FormFields fields={config.fields} value={value} errors={errors} onChange={setValue} />
          </div>
          <footer className="editor__actions">
            <button type="submit" className="button button--primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </footer>
        </>
      )}
    </form>
  )
}
