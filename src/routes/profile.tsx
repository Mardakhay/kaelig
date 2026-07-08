import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@pages/profile'
import { RequireAuth } from '@widgets/auth-guard'

export const Route = createFileRoute('/profile')({
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
})
