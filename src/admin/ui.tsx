import { Icon } from '@/components/Icon'

export type NoticeState = { kind: 'success' | 'error'; text: string } | null

/** Inline result message for a save, delete or load. */
export function Notice({ state }: { state: NoticeState }) {
  if (!state) return <div role="status" aria-live="polite" />
  return (
    <div className={`notice notice--${state.kind}`} role={state.kind === 'error' ? 'alert' : 'status'} aria-live="polite">
      <Icon name={state.kind === 'error' ? 'alert' : 'check'} size={16} />
      {state.text}
    </div>
  )
}
