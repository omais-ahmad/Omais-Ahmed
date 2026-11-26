import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Icon } from '@/components/Icon'
import { BLANK_ITEMS } from '@/content/defaults'
import type { ItemRow } from '@/lib/content-mapping'
import { formatDateTime, slugify } from '@/lib/format'
import { createItem, deleteItem, listItems, saveOrder, updateItem } from './api'
import { FormFields } from './FormFields'
import { validateFields, type CollectionConfig, type FieldErrors } from './schemas'
import { Notice, type NoticeState } from './ui'

type Value = Record<string, unknown>

interface Editing {
  /** null while creating a new item */
  id: string | null
  value: Value
  published: boolean
}

/** List, create, edit, delete, reorder and publish the items of one collection. */
export function CollectionManager({ config }: { config: CollectionConfig }) {
  const [rows, setRows] = useState<ItemRow[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<Editing | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<NoticeState>(null)

  const load = useCallback(async () => {
    setLoadError('')
    try {
      setRows(await listItems(config.key))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Loading failed.')
    }
  }, [config.key])

  useEffect(() => {
    setRows(null)
    setEditing(null)
    setNotice(null)
    void load()
  }, [load])

  /** Runs a mutation with shared busy and error handling. */
  const run = async (action: () => Promise<void>, success?: string) => {
    setBusy(true)
    setNotice(null)
    try {
      await action()
      if (success) setNotice({ kind: 'success', text: success })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'The change could not be saved.' })
      await load()
    } finally {
      setBusy(false)
    }
  }

  const startCreate = () => {
    setErrors({})
    setNotice(null)
    setEditing({ id: null, value: structuredClone(BLANK_ITEMS[config.key]) as unknown as Value, published: false })
  }

  const startEdit = (row: ItemRow) => {
    setErrors({})
    setNotice(null)
    setEditing({ id: row.id, value: { ...(BLANK_ITEMS[config.key] as unknown as Value), ...structuredClone(row.data) }, published: row.published })
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing || !rows) return
    const value = { ...editing.value }
    if (config.key === 'projects' && !value.slug && typeof value.name === 'string') value.slug = slugify(value.name)

    const found = validateFields(config.fields, value)
    if (config.key === 'projects' && rows.some((row) => row.id !== editing.id && row.data.slug === value.slug)) {
      found.slug = 'Another project already uses this slug.'
    }
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setEditing({ ...editing, value })
      setNotice({ kind: 'error', text: 'Please correct the highlighted fields.' })
      return
    }

    await run(async () => {
      if (editing.id) {
        const updated = await updateItem(editing.id, { data: value, published: editing.published })
        setRows(rows.map((row) => (row.id === updated.id ? updated : row)))
      } else {
        const position = rows.reduce((max, row) => Math.max(max, row.position + 1), 0)
        const created = await createItem(config.key, value, position, editing.published)
        setRows([...rows, created])
      }
      setEditing(null)
    }, 'Saved.')
  }

  const move = (index: number, delta: number) => {
    if (!rows) return
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target] as ItemRow, next[index] as ItemRow]
    void run(async () => {
      await saveOrder(next)
      setRows(next.map((row, position) => ({ ...row, position })))
    })
  }

  const togglePublished = (row: ItemRow) =>
    void run(async () => {
      const updated = await updateItem(row.id, { published: !row.published })
      setRows((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null)
    }, row.published ? 'Unpublished. It is no longer visible on the site.' : 'Published.')

  const remove = (row: ItemRow) => {
    if (!window.confirm(`Delete "${config.title(row.data)}"? This cannot be undone.`)) return
    void run(async () => {
      await deleteItem(row.id)
      setRows((current) => current?.filter((item) => item.id !== row.id) ?? null)
    }, 'Deleted.')
  }

  if (editing) {
    return (
      <form className="editor" onSubmit={save} noValidate>
        <header className="admin-head">
          <div>
            <h1>{editing.id ? `Edit ${config.singular}` : `New ${config.singular}`}</h1>
            <p>{config.description}</p>
          </div>
        </header>
        <Notice state={notice} />
        <div className="editor__fields">
          <FormFields fields={config.fields} value={editing.value} errors={errors} onChange={(value) => setEditing({ ...editing, value })} />
          <div className="field field--check">
            <input id="editor-published" type="checkbox" checked={editing.published} onChange={(event) => setEditing({ ...editing, published: event.target.checked })} />
            <label htmlFor="editor-published">Published (visible on the public site)</label>
          </div>
        </div>
        <footer className="editor__actions">
          <button type="submit" className="button button--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="button button--ghost" disabled={busy} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </footer>
      </form>
    )
  }

  return (
    <section>
      <header className="admin-head">
        <div>
          <h1>{config.label}</h1>
          <p>{config.description}</p>
        </div>
        <button type="button" className="button button--primary" onClick={startCreate} disabled={!rows}>
          <Icon name="plus" size={16} />
          New {config.singular}
        </button>
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
      {!rows && !loadError && (
        <p className="admin-state" role="status">
          Loading…
        </p>
      )}
      {rows?.length === 0 && (
        <div className="admin-state">
          <p>No {config.label.toLowerCase()} yet.</p>
          <button type="button" className="button button--ghost button--small" onClick={startCreate}>
            <Icon name="plus" size={15} /> Add the first {config.singular}
          </button>
        </div>
      )}

      {rows && rows.length > 0 && (
        <ol className="rows" aria-busy={busy}>
          {rows.map((row, index) => {
            const title = config.title(row.data)
            return (
              <li className="row" key={row.id}>
                <div className="row__order">
                  <button type="button" className="icon-button icon-button--small" aria-label={`Move ${title} up`} disabled={busy || index === 0} onClick={() => move(index, -1)}>
                    <Icon name="arrow-up" size={15} />
                  </button>
                  <button type="button" className="icon-button icon-button--small" aria-label={`Move ${title} down`} disabled={busy || index === rows.length - 1} onClick={() => move(index, 1)}>
                    <Icon name="arrow-down" size={15} />
                  </button>
                </div>
                <div className="row__main">
                  <p className="row__title">
                    {title}
                    <span className={`badge ${row.published ? 'badge--live' : 'badge--draft'}`}>{row.published ? 'Published' : 'Draft'}</span>
                  </p>
                  <p className="row__meta">
                    {config.subtitle?.(row.data)}
                    {row.updated_at && <span> · Updated {formatDateTime(row.updated_at)}</span>}
                  </p>
                </div>
                <div className="row__actions">
                  <button type="button" className="button button--ghost button--small" disabled={busy} onClick={() => togglePublished(row)}>
                    <Icon name={row.published ? 'eye-off' : 'eye'} size={15} />
                    {row.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className="button button--ghost button--small" disabled={busy} onClick={() => startEdit(row)}>
                    <Icon name="edit" size={15} />
                    Edit
                  </button>
                  <button type="button" className="button button--danger button--small" disabled={busy} aria-label={`Delete ${title}`} onClick={() => remove(row)}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
