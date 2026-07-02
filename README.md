# Kaelig

A modern game discovery platform inspired by Steam, RAWG, and Backloggd. Browse trending games, manage your library, track your gaming progress, and discover your next favorite title.

## Features

- **Game Discovery** — Browse trending, popular, upcoming, and newly released games from the RAWG API
- **Advanced Search** — Find games by title with real-time suggestions and keyboard navigation
- **Smart Filters** — Filter by genre, platform, release year, Metacritic score, rating, and ordering
- **Personal Library** — Manage favorites, wishlist, currently playing, and completed games
- **Gaming Statistics** — View detailed stats including favorite genres, platforms, and completion rates
- **Infinite Scroll** — Seamless browsing with Intersection Observer and prefetching
- **Game Details** — Rich game pages with trailers, screenshots, requirements, and related games
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Smooth Animations** — Page transitions, card animations, and modal effects with Framer Motion
- **Offline Persistence** — Library data persisted to LocalStorage via Zustand

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
| Animation | Framer Motion |
| Icons | Lucide React |
| Architecture | Feature-Sliced Design |

## Architecture

```
src/
├── app/                    # Application layer
│   ├── providers/          # Context providers (Theme, Query, Router)
│   ├── router/             # Route definitions and configuration
│   └── styles/             # Global styles and design tokens
├── pages/                  # Page components
│   ├── home/               # Landing page with game sections
│   ├── search/             # Search with filters and infinite scroll
│   ├── game/               # Game details page
│   ├── library/            # Personal game library
│   └── profile/            # User statistics
├── widgets/                # Complex UI blocks
│   ├── header/             # Responsive header with navigation
│   ├── sidebar/            # Collapsible sidebar (desktop)
│   ├── footer/             # Site footer
│   ├── mobile-nav/         # Bottom tab bar (mobile)
│   └── layout/              # Main layout wrapper
├── features/               # User interactions
│   ├── game-filters/       # Filter controls for search
│   └── library/            # Library actions (add, remove, move)
├── entities/               # Business domain
│   ├── game/               # Game entity (API, hooks, UI)
│   └── user/               # User entity
└── shared/                 # Shared infrastructure
    ├── api/                # RAWG API client
    ├── config/             # Environment configuration
    ├── hooks/              # Custom hooks (useTheme)
    ├── lib/                # Utilities (cn)
    ├── types/              # Shared types
    └── ui/                 # Design system components
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- RAWG API key

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

4. Add your RAWG API key to `.env`:
   ```env
   VITE_RAWG_API_KEY=your_rawg_api_key
   VITE_RAWG_API_URL=https://api.rawg.io/api
   ```

5. Start the development server:
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

Get your free API key at [RAWG Developer Portal](https://rawg.io/apidocs).

## Screenshots

_Screenshots can be added here once the project is deployed._

## Lighthouse Scores

_Target scores for production:_

| Category | Target |
|----------|--------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 100 |
| SEO | 100 |

## Key Optimizations

- **Memoization** — GameCard and reusable components memoized for render performance
- **Lazy Loading** — Images loaded lazily with `loading="lazy"` and `decoding="async"`
- **Code Splitting** — TanStack Router with pending states and preload delays
- **Prefetching** — Next pages prefetched for infinite scroll smoothness
- **Staggered Animations** — Efficient Framer Motion variants for list animations
- **Preconnect** — API and image domains preconnected for faster fetches

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on interactive elements
- Keyboard navigation support (Escape, Arrow keys, Enter)
- Focus visible states on all interactive elements
- Color contrast compliant with WCAG guidelines
- Screen reader friendly (sr-only labels, proper roles)

## Future Improvements

- [ ] User authentication with Supabase
- [ ] Cloud sync for library data
- [ ] Game reviews and ratings
- [ ] Social features (friends, activity feed)
- [ ] Push notifications for release dates
- [ ] PWA with offline support
- [ ] Dark/light theme toggle
- [ ] Internationalization (i18n)
- [ ] Game collections and custom lists

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [RAWG](https://rawg.io) for the comprehensive games API
- [TanStack](https://tanstack.com) for excellent routing and query libraries
- [Framer Motion](https://motion.dev) for smooth animations
- [Lucide](https://lucide.dev) for beautiful icons
