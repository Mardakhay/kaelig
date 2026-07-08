import { createFileRoute } from '@tanstack/react-router'
import { LibraryPage } from '@pages/library'
import { RequireAuth } from '@widgets/auth-guard'

export const Route = createFileRoute('/library')({
  component: () => (
    <RequireAuth>
      <LibraryPage />
    </RequireAuth>
  ),
})
