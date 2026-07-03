import { ThemeProvider } from '@app/providers'
import { QueryProvider } from '@app/providers'
import { RouterProvider } from '@app/providers'
import { ErrorBoundary } from '@shared/ui/error-boundary'

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <RouterProvider />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
