import { type ReactNode, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@shared/hooks'
import { Loader } from '@shared/ui/loader'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void navigate({ to: '/auth' })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Checking sign-in status">
        <Loader size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
