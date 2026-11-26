import { useId, useRef, useState, type ChangeEvent } from 'react'
import { Icon } from '@/components/Icon'
import { assetUrl } from '@/lib/config'
import { UPLOAD_RULES, uploadFile } from './api'
import type { Field, FieldErrors, GroupField, JsonField, UploadField } from './schemas'

type Value = Record<string, unknown>

interface Props {
  fields: Field[]
  value: Value
  errors: FieldErrors
  onChange: (next: Value) => void
  /** Dotted path of the parent, used to look errors up. */
  path?: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

/** Renders an editable form from field definitions. */
export function FormFields({ fields, value, errors, onChange, path = '' }: Props) {
  const uid = useId()
  const set = (name: string, next: unknown) => onChange({ ...value, [name]: next })

  return (
    <>
      {fields.map((field) => {
        const id = `${uid}-${field.name}`
        const fieldPath = path + field.name
        const error = errors[fieldPath]
        const describedBy = [field.help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
        const footer = (
          <>
            {field.help && (
              <p className="field__help" id={`${id}-help`}>
                {field.help}
              </p>
            )}
            {error && (
              <p className="field__error" id={`${id}-error`}>
                {error}
              </p>
            )}
          </>
        )
        const label = (
          <label htmlFor={id}>
            {field.label}
            {field.required && <span className="field__required"> *</span>}
          </label>
        )
        const wrapper = `field${error ? ' has-error' : ''}`

        switch (field.type) {
          case 'boolean':
            return (
              <div className="field field--check" key={field.name}>
                <input id={id} type="checkbox" checked={value[field.name] === true} onChange={(event) => set(field.name, event.target.checked)} aria-describedby={describedBy} />
                <label htmlFor={id}>{field.label}</label>
                {footer}
              </div>
            )

          case 'toggles': {
            const current = (value[field.name] as Record<string, boolean> | undefined) ?? {}
            return (
              <fieldset className="field field--toggles" key={field.name}>
                <legend>{field.label}</legend>
                {field.options.map((option) => (
                  <label key={option.value} className="toggle">
                    <input
                      type="checkbox"
                      checked={current[option.value] !== false}
                      onChange={(event) => set(field.name, { ...current, [option.value]: event.target.checked })}
                    />
                    {option.label}
                  </label>
                ))}
                {footer}
              </fieldset>
            )
          }

          case 'select':
            return (
              <div className={wrapper} key={field.name}>
                {label}
                <select id={id} value={asString(value[field.name])} onChange={(event) => set(field.name, event.target.value)} aria-describedby={describedBy}>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {footer}
              </div>
            )

          case 'list': {
            const lines = Array.isArray(value[field.name]) ? (value[field.name] as string[]) : []
            return (
              <div className={wrapper} key={field.name}>
                {label}
                <ListInput id={id} rows={field.rows ?? 4} lines={lines} onChange={(next) => set(field.name, next)} describedBy={describedBy} invalid={Boolean(error)} />
                {footer}
              </div>
            )
          }

          case 'upload':
            return (
              <div className={wrapper} key={field.name}>
                {label}
                <UploadInput id={id} field={field} value={asString(value[field.name])} onChange={(next) => set(field.name, next)} describedBy={describedBy} />
                {footer}
              </div>
            )

          case 'json':
            return (
              <div className={wrapper} key={field.name}>
                {label}
                <JsonInput id={id} field={field} value={value[field.name] ?? null} onChange={(next) => set(field.name, next)} describedBy={describedBy} />
                {footer}
              </div>
            )

          case 'group':
            return (
              <GroupInput
                key={field.name}
                field={field}
                items={Array.isArray(value[field.name]) ? (value[field.name] as Value[]) : []}
                errors={errors}
                path={fieldPath}
                onChange={(next) => set(field.name, next)}
              />
            )

          case 'textarea':
            return (
              <div className={wrapper} key={field.name}>
                {label}
                <textarea
                  id={id}
                  rows={field.rows ?? 4}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  value={asString(value[field.name])}
                  onChange={(event) => set(field.name, event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                />
                {footer}
              </div>
            )

          default:
            return (
              <div className={wrapper} key={field.name}>
                {label}
                <input
                  id={id}
                  type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  value={asString(value[field.name])}
                  onChange={(event) => set(field.name, event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  autoComplete="off"
                  spellCheck={field.type === 'text'}
                />
                {footer}
              </div>
            )
        }
      })}
    </>
  )
}

/** One entry per line. Keeps the raw text locally so that blank lines survive while typing. */
function ListInput(props: { id: string; rows: number; lines: string[]; onChange: (next: string[]) => void; describedBy?: string; invalid: boolean }) {
  const [draft, setDraft] = useState(() => props.lines.join('\n'))
  return (
    <textarea
      id={props.id}
      rows={props.rows}
      value={draft}
      aria-invalid={props.invalid ? true : undefined}
      aria-describedby={props.describedBy}
      onChange={(event) => {
        setDraft(event.target.value)
        props.onChange(
          event.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        )
      }}
    />
  )
}

/** JSON editor: the parsed value is only passed up while the text is valid JSON. */
function JsonInput(props: { id: string; field: JsonField; value: unknown; onChange: (next: unknown) => void; describedBy?: string }) {
  const [draft, setDraft] = useState(() => JSON.stringify(props.value, null, 2))
  const [syntaxError, setSyntaxError] = useState('')
  return (
    <>
      <textarea
        id={props.id}
        className="field__code"
        rows={10}
        spellCheck={false}
        value={draft}
        aria-invalid={syntaxError ? true : undefined}
        aria-describedby={props.describedBy}
        onChange={(event) => {
          const text = event.target.value
          setDraft(text)
          try {
            props.onChange(text.trim() === '' ? null : JSON.parse(text))
            setSyntaxError('')
          } catch {
            setSyntaxError('This is not valid JSON yet. The last valid version is what will be saved.')
          }
        }}
      />
      {syntaxError && <p className="field__error">{syntaxError}</p>}
    </>
  )
}

function UploadInput(props: { id: string; field: UploadField; value: string; onChange: (next: string) => void; describedBy?: string }) {
  const { field, value } = props
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const rule = UPLOAD_RULES[field.kind]

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setMessage('')
    try {
      // The file this replaces is left in storage on purpose: the form has not been saved yet,
      // and the published page may still be showing it.
      props.onChange(await uploadFile(file, field.kind, field.folder))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="upload">
      {value && field.kind === 'image' && <img className="upload__preview" src={assetUrl(value)} alt="" />}
      <div className="upload__controls">
        <input
          id={props.id}
          type="text"
          value={value}
          placeholder="Upload a file, or paste a URL or site path"
          onChange={(event) => props.onChange(event.target.value)}
          aria-describedby={props.describedBy}
          autoComplete="off"
        />
        <input ref={input} type="file" accept={rule.types.join(',')} hidden onChange={onFile} aria-label={`Choose a file for ${field.label}`} />
        <button type="button" className="button button--ghost button--small" disabled={busy} onClick={() => input.current?.click()}>
          <Icon name="upload" size={15} />
          {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button type="button" className="button button--ghost button--small" onClick={() => props.onChange('')}>
            Clear
          </button>
        )}
      </div>
      <p className="field__help">{rule.label}.</p>
      {message && (
        <p className="field__error" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}

function GroupInput(props: { field: GroupField; items: Value[]; errors: FieldErrors; path: string; onChange: (next: Value[]) => void }) {
  const { field, items } = props
  // Stable keys for rows that have no id of their own, kept in step with every structural change.
  const nextKey = useRef(0)
  const [keys, setKeys] = useState<number[]>(() => items.map(() => nextKey.current++))
  if (keys.length !== items.length) setKeys(items.map((_, index) => keys[index] ?? nextKey.current++))

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const swap = <T,>(list: T[]) => {
      const copy = [...list]
      ;[copy[index], copy[target]] = [copy[target] as T, copy[index] as T]
      return copy
    }
    setKeys(swap(keys))
    props.onChange(swap(items))
  }

  return (
    <fieldset className="group">
      <legend>{field.label}</legend>
      {field.help && <p className="field__help">{field.help}</p>}
      {items.length === 0 && <p className="group__empty">Nothing added yet.</p>}
      {items.map((item, index) => (
        <div className="group__item" key={keys[index] ?? index}>
          <div className="group__bar">
            <span>
              {field.itemLabel} {index + 1}
            </span>
            <button type="button" className="icon-button icon-button--small" aria-label={`Move ${field.itemLabel} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>
              <Icon name="arrow-up" size={15} />
            </button>
            <button type="button" className="icon-button icon-button--small" aria-label={`Move ${field.itemLabel} ${index + 1} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)}>
              <Icon name="arrow-down" size={15} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--small"
              aria-label={`Remove ${field.itemLabel} ${index + 1}`}
              onClick={() => {
                setKeys(keys.filter((_, position) => position !== index))
                props.onChange(items.filter((_, position) => position !== index))
              }}
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
          <div className="group__fields">
            <FormFields
              fields={field.fields}
              value={item}
              errors={props.errors}
              path={`${props.path}.${index}.`}
              onChange={(next) => props.onChange(items.map((current, position) => (position === index ? next : current)))}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="button button--ghost button--small"
        onClick={() => {
          setKeys([...keys, nextKey.current++])
          props.onChange([...items, { ...field.blank }])
        }}
      >
        <Icon name="plus" size={15} />
        Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  )
}
