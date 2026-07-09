# Kaelig

A modern game discovery platform inspired by Steam, RAWG, and Backloggd. Browse trending games, sign in to build a personal library, track your gaming progress, and discover your next favorite title.

## Features

- **Authentication** — Email/password sign-up and sign-in backed by Supabase Auth
- **Game Discovery** — Browse trending, popular, upcoming, and newly released games from the RAWG API
- **Advanced Search** — Find games by title with real-time suggestions and keyboard navigation
- **Smart Filters** — Filter by genre, platform, release year, Metacritic score, rating, and ordering
- **Personal Library** — Manage favorites, wishlist, currently playing, and completed games, synced to your account
- **Gaming Statistics** — View detailed stats including favorite genres, platforms, and completion rates
- **Infinite Scroll** — Seamless browsing with Intersection Observer and prefetching
- **Game Details** — Rich game pages with trailers, screenshots, requirements, and related games
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Smooth Animations** — Page transitions, card animations, and modal effects with Framer Motion
- **Cloud Persistence** — Library and profile data stored in Supabase (Postgres) with row-level security, so it follows you across devices
- **Live Sync** — Changes to your library propagate to any other open tab or device in real time via Supabase Realtime
- **Resilient Writes** — Library edits apply instantly, roll back automatically if the write fails server-side, and surface a toast so you always know the true state

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Routing | TanStack Router |
| State | TanStack Query, Zustand |
| Forms | React Hook Form, Zod |
| Auth & Database | Supabase (Postgres, Auth, Row-Level Security, Realtime) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Testing | Vitest |
| Architecture | Feature-Sliced Design |

## Architecture

```
src/
├── app/                    # Application layer
│   ├── providers/          # Context providers (Theme, Query, Auth, Router)
│   ├── router/             # Route definitions and configuration
│   └── styles/             # Global styles and design tokens
├── pages/                  # Page components
│   ├── home/               # Landing page with game sections
│   ├── search/             # Search with filters and infinite scroll
│   ├── game/                # Game details page
│   ├── auth/                # Sign-in / create-account page
│   ├── library/             # Personal game library (requires sign-in)
│   └── profile/             # Account info and user statistics (requires sign-in)
├── widgets/                 # Complex UI blocks
│   ├── header/              # Responsive header with navigation and user menu
│   ├── sidebar/              # Collapsible sidebar (desktop)
│   ├── footer/                # Site footer
│   ├── mobile-nav/            # Bottom tab bar (mobile)
│   ├── auth-guard/            # Route guard that redirects signed-out users to /auth
│   └── layout/                 # Main layout wrapper
├── features/                    # User interactions
│   └── game-filters/            # Filter controls for search
├── entities/                     # Business domain
│   ├── game/                     # Game entity (API, hooks, UI, library store + tests)
│   └── user/                     # User entity (auth service, types)
└── shared/                        # Shared infrastructure
    ├── api/                       # RAWG API client, Supabase client
    ├── config/                    # Environment configuration
    ├── hooks/                     # Custom hooks (useTheme, useAuth)
    ├── lib/                       # Utilities (cn)
    └── ui/                        # Design system components (incl. toast notifications)
```

Unit tests live alongside the code they cover (e.g. `libraryStore.test.ts` next to `libraryStore.ts`) rather than in a separate top-level directory.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A [RAWG API](https://rawg.io/apidocs) key
- A [Supabase](https://supabase.com) project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kaelig.git
   cd kaelig
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Fill in `.env`:
   ```env
   VITE_RAWG_API_KEY=your_rawg_api_key
   VITE_RAWG_API_URL=https://api.rawg.io/api

   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
   ```
   The Supabase URL and anon/publishable key are found in your project's Dashboard under **Settings → API**. If either is missing, the app still boots (RAWG-only browsing works), but logs a clear error to the console instead of failing silently.

5. Set up the database schema in your Supabase project (SQL editor or CLI migrations):
   - `profiles` — one row per user (`id`, `username`, `avatar_url`, `created_at`), auto-populated on sign-up via a trigger on `auth.users`
   - `library_games` — one row per `(user_id, game_id)` with a `status` (`favorites` / `wishlist` / `playing` / `completed`) and cached game metadata
   - Both tables have Row-Level Security enabled so a user can only read/write their own rows
   - Enable Realtime on `library_games` (Database → Replication) so changes propagate live to other open tabs/devices for the same account

6. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run the unit test suite once |
| `npm run test:watch` | Run the unit test suite in watch mode |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_RAWG_API_KEY` | RAWG API key | Yes |
| `VITE_RAWG_API_URL` | RAWG API base URL | No (defaults to `https://api.rawg.io/api`) |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Yes |

## Authentication & Data

- Sign-up and sign-in are email/password only, handled through Supabase Auth (`src/entities/user`, `src/app/providers/AuthProvider.tsx`). Email confirmation is disabled — signing up immediately signs the user in.
- `/library` and `/profile` are gated behind sign-in via `RequireAuth` (`src/widgets/auth-guard`); visiting either while signed out redirects to `/auth`.
- Favoriting a game while signed out sends you to `/auth` instead of failing silently.
- Auth state is only re-hydrated on an actual sign-in transition (a change in user ID) rather than on every Supabase auth event — so a background token refresh (e.g. from switching browser tabs) can't reset and re-flash the library mid-session.

### Library store reliability

The library store (`src/entities/game/model/libraryStore.ts`) hydrates from Supabase on sign-in, writes through on every add/remove/move, and resets on sign-out. All access is enforced server-side by RLS policies rather than trusted to the client. On top of that:

- **Race-free status changes** — moving a game between lists (e.g. wishlist → favorites) issues a single atomic `UPDATE`, never a separate delete-then-insert, so a slow network can't cause a game to vanish between the two calls.
- **Reactive status everywhere it's read** — favorite/library state is derived from the actual data, not a cached function reference, so UI (like the heart icon) always reflects the real state immediately after a click.
- **Stale-response guard** — hydration tracks which request is newest, so a slow response from an old session (e.g. after switching accounts) can never overwrite fresher data.
- **Optimistic writes with rollback** — every add/remove/move updates the UI immediately, then automatically reverts and shows a toast if the underlying write fails.
- **Pending-state locking** — write buttons (favorite heart, library remove/move) disable while a request for that game is in flight, preventing overlapping writes from a rapid double-click.
- **Live cross-device sync** — a Supabase Realtime subscription mirrors remote changes into the local store, so the library stays in sync across tabs and devices without a manual refresh.

## Key Optimizations

- **Memoization** — GameCard and reusable components memoized for render performance
- **Lazy Loading** — Images loaded lazily with `loading="lazy"` and `decoding="async"`
- **Code Splitting** — TanStack Router with pending states and preload delays
- **Prefetching** — Next pages prefetched for infinite scroll smoothness
- **Staggered Animations** — Efficient Framer Motion variants for list animations
- **Preconnect** — API and image domains preconnected for faster fetches

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on interactive elements, including form fields, auth error alerts, and pending/busy states on write buttons
- Keyboard navigation support (Escape, Arrow keys, Enter)
- Focus visible states on all interactive elements
- Color contrast compliant with WCAG guidelines
- Screen reader friendly (sr-only labels, proper roles, `aria-live` toast region)
