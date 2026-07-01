import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Film,
  Gamepad2,
  Globe,
  MonitorPlay,
  Play,
  Shield,
  Star,
  Tag,
  Users,
} from 'lucide-react'
import { Link, useParams } from '@tanstack/react-router'
import {
  GameCard,
  GameCardSkeleton,
  mapRawgGameToGameCard,
  useGameDetailsQuery,
  useGameMoviesQuery,
  useGameScreenshotsQuery,
  useGamesQuery,
} from '@entities/game'

const motionSection = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' as const },
}

export function GamePage() {
  const { id } = useParams({ from: '/game/$id' })
  const detailsQuery = useGameDetailsQuery(id)
  const screenshotsQuery = useGameScreenshotsQuery(id)
  const moviesQuery = useGameMoviesQuery(id)

  const details = detailsQuery.data
  const primaryGenre = details?.genres[0]?.slug
  const relatedQuery = useGamesQuery(
    {
      genres: primaryGenre,
      page_size: 8,
      ordering: '-rating',
    },
    { enabled: Boolean(primaryGenre) }
  )

  const relatedGames =
    relatedQuery.data?.results
      .filter(game => String(game.id) !== id)
      .map(mapRawgGameToGameCard) ?? []

  if (detailsQuery.isLoading) {
    return <GamePageSkeleton />
  }

  if (detailsQuery.error || !details) {
    return <GamePageError message={detailsQuery.error?.message ?? 'Game not found.'} />
  }

  const screenshots = screenshotsQuery.data?.results ?? []
  const trailer = moviesQuery.data?.results[0]
  const galleryImages = [
    details.background_image,
    ...screenshots.slice(0, 6).map(item => item.image),
  ].filter((image): image is string => Boolean(image))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 px-4 py-6 sm:px-6 lg:px-8"
    >
      <Link
        to="/search"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <motion.section
        {...motionSection}
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 p-6 sm:p-8 lg:p-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <Badge icon={Star} label={`${details.rating.toFixed(1)} rating`} />
                {details.metacritic !== null && <Badge icon={Shield} label={`Metacritic ${details.metacritic}`} />}
                {details.released && (
                  <Badge icon={CalendarDays} label={new Date(details.released).getFullYear().toString()} />
                )}
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  {details.name}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {details.description_raw || 'No description available for this game yet.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionLink
                href={details.website || `https://rawg.io/games/${details.slug}`}
                icon={Globe}
                label="Official site"
              />
              <ActionLink
                href={`https://rawg.io/games/${details.slug}`}
                icon={ExternalLink}
                label="RAWG page"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                icon={Gamepad2}
                label="Developers"
                value={details.developers.map(item => item.name).join(', ') || 'Unknown'}
              />
              <InfoCard
                icon={Users}
                label="Publishers"
                value={details.publishers.map(item => item.name).join(', ') || 'Unknown'}
              />
              <InfoCard
                icon={Tag}
                label="Genres"
                value={details.genres.map(item => item.name).join(', ') || 'Unknown'}
              />
              <InfoCard
                icon={MonitorPlay}
                label="Platforms"
                value={details.platforms?.map(item => item.platform.name).join(', ') || 'Unknown'}
              />
            </div>
          </div>

          <div className="relative min-h-[24rem] bg-muted lg:min-h-[36rem]">
            <img
              src={details.background_image ?? galleryImages[0]}
              alt={details.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <div className="rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hero banner</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{details.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {details.released ? new Date(details.released).toLocaleDateString() : 'Release date unavailable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...motionSection} className="space-y-4">
        <SectionTitle icon={Film} title="Trailer" subtitle="Official movie preview from RAWG." />
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {moviesQuery.isLoading ? (
            <div className="aspect-video animate-pulse bg-muted" />
          ) : trailer ? (
            <video
              className="aspect-video w-full bg-black"
              controls
              playsInline
              poster={trailer.preview}
              src={trailer.data.max}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
              Trailer not available.
            </div>
          )}
        </div>
      </motion.section>

      <motion.section {...motionSection} className="space-y-4">
        <SectionTitle icon={Play} title="Gallery" subtitle="Screenshots and the main hero image." />
        {screenshotsQuery.isLoading ? (
          <GallerySkeleton />
        ) : galleryImages.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {galleryImages.map(image => (
              <figure key={image} className="overflow-hidden rounded-lg border border-border bg-card">
                <img
                  src={image}
                  alt={`${details.name} screenshot`}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Screenshots not available.
          </div>
        )}
      </motion.section>

      <motion.section {...motionSection} className="space-y-4">
        <SectionTitle icon={Shield} title="Requirements" subtitle="Minimum and recommended platform requirements." />
        <div className="grid gap-4 lg:grid-cols-2">
          {(details.platforms ?? []).map(platform => (
            <div key={platform.platform.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{platform.platform.name}</h3>
                {platform.released_at && (
                  <span className="text-xs text-muted-foreground">{platform.released_at}</span>
                )}
              </div>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <RequirementBlock label="Minimum" value={platform.requirements_en?.minimum} />
                <RequirementBlock label="Recommended" value={platform.requirements_en?.recommended} />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...motionSection} className="space-y-4">
        <SectionTitle icon={Gamepad2} title="Related Games" subtitle="Similar games based on the primary genre." />
        {relatedQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        ) : relatedGames.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Related games not available.
          </div>
        )}
      </motion.section>
    </motion.div>
  )
}

function Badge({ icon: Icon, label }: { icon: typeof Star; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-primary">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Globe
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted"
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gamepad2
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground">{value}</p>
    </div>
  )
}

function RequirementBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value ?? 'Not provided.'}
      </p>
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Film
  title: string
  subtitle: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="aspect-[16/10] animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

function GamePageSkeleton() {
  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 p-6 sm:p-8 lg:p-10">
            <div className="h-4 w-44 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-3/4 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
          <div className="min-h-[24rem] animate-pulse bg-muted lg:min-h-[36rem]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

function GamePageError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-foreground">Unable to load game details</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Link
        to="/search"
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Back to search
      </Link>
    </div>
  )
}
