# Kaelig

A modern game discovery platform inspired by Steam, RAWG, and Backloggd. Discover games, search with filters, and maintain a personal gaming library.

## Features

- Email/password authentication with Supabase Auth
- Game discovery and details powered by RAWG
- Search suggestions, genre/platform/year/rating filters, and infinite scroll
- Personal favorites, wishlist, playing, and completed lists
- Library and profile persistence through Supabase
- Optimistic library updates with rollback on failed writes
- Realtime library synchronization across open sessions
- Responsive UI, dark/light themes, keyboard support, and reduced-motion support

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router and Query, Zustand, Supabase, RAWG, React Hook Form, Zod, Framer Motion, Vitest, and ESLint.

## Requirements

- Node.js 20.19+ or 22.12+ (required by current Vite 8)
- npm
- A [RAWG API key](https://rawg.io/apidocs)
- A [Supabase project](https://supabase.com)

## Quick start

```bash
git clone https://github.com/Mardakhay/kaelig.git
cd kaelig
npm ci
cp .env.example .env
```

Fill in the environment values, then run:

```bash
npm run dev
```

The development server prints the local URL (normally `http://localhost:5173`).

## Environment

Create a local `.env` file. Never commit real credentials.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_RAWG_API_KEY` | Yes for game data | RAWG API key used by the browser client |
| `VITE_RAWG_API_URL` | No | API base URL; defaults to `https://api.rawg.io/api` |
| `VITE_SUPABASE_URL` | Yes for accounts/library | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes for accounts/library | Supabase publishable/legacy anon key; never a service-role/secret key |

All `VITE_*` variables are included in the client bundle. RAWG keys can therefore be seen by visitors; configure API usage restrictions and usage limits where available. Supabase client keys are designed for public clients only when database access is protected by correct Row-Level Security (RLS) policies. Never put a Supabase service-role or secret key in a `VITE_*` variable.

If Supabase settings are absent, the app is intended to remain usable for public game browsing, while authentication and cloud library features will not work. RAWG requests require an API key.

## Supabase setup

The application expects these tables:

### `profiles`

The profile query reads `id`, `username`, `avatar_url`, and `created_at`. The `id` should reference `auth.users.id`. Configure a signup trigger if profiles should be created automatically.

### `library_games`

The client reads/writes `user_id`, `game_id`, `status`, `title`, `image`, `rating`, `release_year`, `platforms`, `genres`, and `added_at`. Use a unique constraint on `(user_id, game_id)`; supported statuses are `favorites`, `wishlist`, `playing`, and `completed`.

Enable RLS on both tables. Every library policy must enforce row ownership using `auth.uid() = user_id`; profiles policies should likewise restrict access to the matching user ID. For example, library read policies should target the `authenticated` role and use `(select auth.uid()) = user_id`. Write policies must enforce ownership in both `USING` and `WITH CHECK` as applicable. Do not rely on client-side filtering for security.

Enable Realtime for `public.library_games` in the Supabase Database Replication settings if cross-tab/device updates are required. Confirm that the configured schema, table, grants, and RLS policies match the application before using a production account.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source files |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

Before submitting a change, run:

```bash
npm run lint
npm run test
npm run build
```

## Project layout

```
src/
├── app/       # Providers, router setup, global styles
├── entities/  # Game/user domain, API services, and library state
├── features/  # User-facing interactions such as game filters
├── pages/     # Route-level screens
├── routes/    # TanStack Router route declarations (generated tree is checked in)
├── shared/    # API clients, config, hooks, UI primitives, utilities
└── widgets/   # Header, navigation, layout, auth guard
```

Tests are colocated with the functionality they cover.

## Reliability notes

- React Query request functions pass their `AbortSignal` through to fetch, allowing obsolete requests to be cancelled.
- Library hydration guards against stale responses when sessions change.
- Library updates are optimistic and surface a toast when persistence fails.
- The database's unique key and RLS policies are important: application logic does not replace database constraints.
- Realtime delivery is best-effort synchronization; the initial hydration remains the source of the current server snapshot.

## Documentation

- [Architecture and data flow](docs/ARCHITECTURE.md)
- [Development and quality checklist](docs/DEVELOPMENT.md)
- [Security and deployment checklist](docs/SECURITY.md)

## License

No license file is currently provided. Unless a license is added to the repository, reuse and redistribution remain subject to the copyright holder's default rights.
