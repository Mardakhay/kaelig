import { type GameCardGame } from '../ui/GameCard'
import { type RawgGame } from '../model/types'
import { getPreferredGameImage } from './gameImage'

export function mapRawgGameToGameCard(game: RawgGame): GameCardGame {
  const releaseYear = game.released ? new Date(game.released).getFullYear() : new Date().getFullYear()
  const platforms = game.parent_platforms?.map(({ platform }) => platform.name) ?? []

  return {
    id: game.id,
    title: game.name,
    image: getPreferredGameImage(game.background_image, game.short_screenshots?.[0]?.image),
    rating: game.rating,
    releaseYear,
    platforms: platforms.length > 0 ? platforms : ['Unknown'],
    genres: game.genres.map(genre => genre.name),
  }
}
