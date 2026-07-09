import { ThemeProvider } from '@app/providers'
import { QueryProvider } from '@app/providers'
import { AuthProvider } from '@app/providers'
import { RouterProvider } from '@app/providers'
import { ErrorBoundary } from '@shared/ui/error-boundary'
import { Toaster } from '@shared/ui/toast'

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <RouterProvider />
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
