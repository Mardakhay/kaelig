import { ArrowRight, Clock, Flame, RefreshCcw, Sparkles, Trophy } from 'lucide-react'
import {
  GameCard,
  GameCardSkeleton,
  mapRawgGameToGameCard,
  useGamesQuery,
  type GameCardGame,
} from '@entities/game'

interface GameSection {
  title: string
  subtitle: string
  icon: typeof Flame
  games: GameCardGame[]
  isLoading: boolean
  error: Error | null
}

const pageSize = 4

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function createDateRange(startDate: Date, endDate: Date) {
  return `${formatDate(startDate)},${formatDate(endDate)}`
}

const today = new Date()
const upcomingEndDate = new Date(today)
upcomingEndDate.setFullYear(today.getFullYear() + 1)
const newReleaseStartDate = new Date(today)
newReleaseStartDate.setDate(today.getDate() - 90)

export function HomePage() {
  const trendingQuery = useGamesQuery({
    page_size: pageSize,
    ordering: '-added',
  })
  const popularQuery = useGamesQuery({
    page_size: pageSize,
    ordering: '-rating',
  })
  const upcomingQuery = useGamesQuery({
    page_size: pageSize,
    dates: createDateRange(today, upcomingEndDate),
    ordering: 'released',
  })
  const newReleasesQuery = useGamesQuery({
    page_size: pageSize,
    dates: createDateRange(newReleaseStartDate, today),
    ordering: '-released',
  })

  const trendingGames = trendingQuery.data?.results.map(mapRawgGameToGameCard) ?? []
  const popularGames = popularQuery.data?.results.map(mapRawgGameToGameCard) ?? []
  const upcomingGames = upcomingQuery.data?.results.map(mapRawgGameToGameCard) ?? []
  const newReleaseGames = newReleasesQuery.data?.results.map(mapRawgGameToGameCard) ?? []
  const featuredGame = trendingGames[0]

  const sections: GameSection[] = [
    {
      title: 'Trending',
      subtitle: 'Games gaining momentum across the community.',
      icon: Flame,
      games: trendingGames,
      isLoading: trendingQuery.isLoading,
      error: trendingQuery.error,
    },
    {
      title: 'Popular',
      subtitle: 'Highly rated picks players keep coming back to.',
      icon: Trophy,
      games: popularGames,
      isLoading: popularQuery.isLoading,
      error: popularQuery.error,
    },
    {
      title: 'Upcoming',
      subtitle: 'Anticipated releases to keep on your radar.',
      icon: Clock,
      games: upcomingGames,
      isLoading: upcomingQuery.isLoading,
      error: upcomingQuery.error,
    },
    {
      title: 'New Releases',
      subtitle: 'Fresh adventures from this release cycle.',
      icon: Sparkles,
      games: newReleaseGames,
      isLoading: newReleasesQuery.isLoading,
      error: newReleasesQuery.error,
    },
  ]

  return (
    <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <HeroSection
        featuredGame={featuredGame}
        isLoading={trendingQuery.isLoading}
        error={trendingQuery.error}
      />

      {sections.map(section => (
        <GameShelf key={section.title} section={section} />
      ))}
    </div>
  )
}

function HeroSection({
  featuredGame,
  isLoading,
  error,
}: {
  featuredGame?: GameCardGame
  isLoading: boolean
  error: Error | null
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Flame className="h-4 w-4" />
              Featured now
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Discover your next favorite game.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Browse live picks across trending, popular, upcoming, and newly released games.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#trending"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explore games
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#new-releases"
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              New releases
            </a>
          </div>
        </div>

        <div className="relative min-h-80 overflow-hidden bg-muted lg:min-h-[30rem]">
          {isLoading && <HeroSkeleton />}
          {!isLoading && error && <HeroError error={error} />}
          {!isLoading && !error && featuredGame && (
            <>
              <img
                src={featuredGame.image}
                alt={featuredGame.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <GameCard game={featuredGame} className="max-w-sm bg-card/90 backdrop-blur" />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function GameShelf({ section }: { section: GameSection }) {
  const Icon = section.icon
  const sectionId = section.title.toLowerCase().replaceAll(' ', '-')

  return (
    <section id={sectionId} className="space-y-4 scroll-mt-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        </div>
      </div>

      {section.isLoading && <GameShelfSkeleton />}
      {!section.isLoading && section.error && <GameShelfError error={section.error} />}
      {!section.isLoading && !section.error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {section.games.map(game => (
            <GameCard key={`${section.title}-${game.id}`} game={game} />
          ))}
        </div>
      )}
    </section>
  )
}

function HeroSkeleton() {
  return (
    <div className="absolute inset-0 animate-pulse bg-muted">
      <div className="absolute bottom-5 left-5 right-5 max-w-sm space-y-4 rounded-lg border border-border bg-card/90 p-4 sm:bottom-6 sm:left-6 sm:right-6">
        <div className="aspect-[4/3] rounded-md bg-border" />
        <div className="h-4 w-2/3 rounded-md bg-border" />
        <div className="h-3 w-1/3 rounded-md bg-border" />
      </div>
    </div>
  )
}

function HeroError({ error }: { error: Error }) {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 p-6 text-center lg:min-h-[30rem]">
      <RefreshCcw className="h-8 w-8 text-error" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Unable to load featured games</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  )
}

function GameShelfSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: pageSize }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  )
}

function GameShelfError({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
      {error.message}
    </div>
  )
}
