import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Rendered instead of the default message when a subtree fails. */
  fallback?: ReactNode
}

interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Render error', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children
    if (this.props.fallback !== undefined) return this.props.fallback
    return (
      <div className="error-state" role="alert">
        <h1>Something went wrong.</h1>
        <p>This part of the page failed to load. Reloading usually fixes it.</p>
        <button type="button" className="button button--primary" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    )
  }
}
