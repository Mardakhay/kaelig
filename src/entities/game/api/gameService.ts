import { rawgRequest } from '@shared/api'
import {
  type GameListParams,
  type RawgGame,
  type RawgGameDetails,
  type RawgPaginatedResponse,
} from '../model/types'

export const gameService = {
  getGames(params: GameListParams = {}, signal?: AbortSignal) {
    return rawgRequest<RawgPaginatedResponse<RawgGame>>('/games', params, signal)
  },

  getGameDetails(id: number | string, signal?: AbortSignal) {
    return rawgRequest<RawgGameDetails>(`/games/${id}`, undefined, signal)
  },
}
