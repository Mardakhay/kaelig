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
| Auth & Database | Supabase (Postgres, Auth, Row-Level Security) |
| Animation | Framer Motion |
| Icons | Lucide React |
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
│   ├── game/                     # Game entity (API, hooks, UI, library store)
│   └── user/                     # User entity (auth service, types)
└── shared/                        # Shared infrastructure
    ├── api/                       # RAWG API client, Supabase client
    ├── config/                    # Environment configuration
    ├── hooks/                     # Custom hooks (useTheme, useAuth)
    ├── lib/                       # Utilities (cn)
    └── ui/                        # Design system components
```

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
   The Supabase URL and anon/publishable key are found in your project's Dashboard under **Settings → API**.

5. Set up the database schema in your Supabase project (SQL editor or CLI migrations):
   - `profiles` — one row per user (`id`, `username`, `avatar_url`, `created_at`), auto-populated on sign-up via a trigger on `auth.users`
   - `library_games` — one row per `(user_id, game_id)` with a `status` (`favorites` / `wishlist` / `playing` / `completed`) and cached game metadata
   - Both tables have Row-Level Security enabled so a user can only read/write their own rows

6. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

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
- The library store (`src/entities/game/model/libraryStore.ts`) hydrates from Supabase on sign-in, writes through on every add/remove/move, and resets on sign-out — all access is enforced server-side by RLS policies rather than trusted to the client.

## Key Optimizations

- **Memoization** — GameCard and reusable components memoized for render performance
- **Lazy Loading** — Images loaded lazily with `loading="lazy"` and `decoding="async"`
- **Code Splitting** — TanStack Router with pending states and preload delays
- **Prefetching** — Next pages prefetched for infinite scroll smoothness
- **Staggered Animations** — Efficient Framer Motion variants for list animations
- **Preconnect** — API and image domains preconnected for faster fetches

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on interactive elements, including form fields and auth error alerts
- Keyboard navigation support (Escape, Arrow keys, Enter)
- Focus visible states on all interactive elements
- Color contrast compliant with WCAG guidelines
- Screen reader friendly (sr-only labels, proper roles)
