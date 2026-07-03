import { Component, type ReactNode, type ErrorInfo } from 'react'
import { TriangleAlert as AlertTriangle, RefreshCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <AlertTriangle className="h-8 w-8 text-error" />
          </div>
          <div className="max-w-md space-y-2 text-center">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
