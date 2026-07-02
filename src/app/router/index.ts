import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPendingMs: 200,
  defaultPreloadDelay: 100,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
