# Architecture

## Runtime overview

Kaelig is a browser-rendered React application built with Vite. `src/main.tsx` mounts the application providers, while TanStack Router owns navigation and route-level components.

## Source boundaries

- **app** — application composition, providers, router setup, and global styles.
- **pages** — route-level UI for discovery, search, game details, authentication, library, and profile.
- **widgets** — cross-page sections such as layout, navigation, header, and auth guard.
- **features** — reusable user interactions such as game filters.
- **entities** — domain types and behavior for games and users. The game entity owns RAWG querying and library state.
- **shared** — API clients, environment configuration, generic hooks, utilities, and design-system primitives.

This is a pragmatic Feature-Sliced Design layout. Keep imports moving inward toward shared/domain primitives rather than creating circular dependencies between pages and widgets.

## Data flow

### Game discovery

1. Page components use hooks from `src/entities/game/api/useGamesQuery.ts`.
2. TanStack Query keys are defined in `queryKeys.ts`, separating list, infinite-list, detail, screenshot, and movie data.
3. `gameService.ts` maps typed service methods to RAWG endpoints.
4. `rawgClient.ts` adds the configured API key, serializes supported query parameters, forwards cancellation signals, and converts non-2xx responses into `RawgApiError`.
5. Presentation adapters convert RAWG payloads to app-friendly card models.

### Authentication

1. `AuthProvider` initializes the current Supabase session and listens for auth-state changes.
2. `authService.ts` wraps Supabase Auth and profile queries.
3. `RequireAuth` protects pages that need a signed-in user.
4. Profile and library access must remain constrained by database-side RLS; client checks are only navigation/UI behavior.

### Personal library

The Zustand store in `src/entities/game/model/libraryStore.ts` owns the four lists and write-pending indicators. On sign-in, `hydrate(userId)` fetches the account's saved rows. Mutations optimistically update UI state, persist the new state to `library_games`, and show a toast plus rollback when the server reports a write error. A request ID prevents an old hydration response from replacing the result of a newer session. Supabase Realtime mirrors row changes for the active user.

The table should have a unique constraint on `(user_id, game_id)`. Use one row per game and a `status` value to represent which list contains the game. RLS is the security boundary.

## State ownership

- Remote/cacheable game data: TanStack Query.
- Session and profile: React context in `AuthProvider`.
- Mutable personal library and pending states: Zustand.
- Transient notices: shared toast store.
- Theme: theme provider and persisted preference.

Avoid duplicating remote query data into global client state unless there is a concrete interaction requirement. Keep query keys stable and include every request parameter that changes the response.

## Error handling

- Expected API failures are surfaced as typed errors and handled at the query/form boundary.
- Unexpected render-time failures are caught by the shared error boundary.
- Library write failures are surfaced using toast messages and rollback optimistic UI state.
- Do not log credentials, session tokens, or sensitive user data.

## Generated routing

`src/routeTree.gen.ts` is generated from the route declarations. When changing route files, run the project build and verify that TanStack Router's Vite plugin regenerates a consistent route tree; avoid hand-editing generated output unless the project generator explicitly requires it.
