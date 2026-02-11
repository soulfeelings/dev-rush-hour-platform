import { Component, type ReactNode } from 'react'
import { TriangleAlert, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './ErrorBoundary.module.scss'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <TriangleAlert size={36} />
            </div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              An unexpected error occurred. Please try reloading the page or go back to the
              homepage.
            </p>
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={this.handleReload}>
                <RotateCcw size={16} />
                Reload Page
              </button>
              <button className={styles.secondaryBtn} onClick={this.handleGoHome}>
                <Home size={16} />
                Homepage
              </button>
            </div>
            {this.state.error && (
              <div className={styles.details}>
                <button className={styles.detailsToggle} onClick={this.toggleDetails}>
                  Error details
                  {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {this.state.showDetails && (
                  <div className={styles.errorText}>{this.state.error.message}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
