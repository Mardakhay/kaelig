import { describe, expect, it } from 'vitest'
import { GAME_IMAGE_FALLBACK, getPreferredGameImage } from './gameImage'

describe('getPreferredGameImage', () => {
  it('uses the first available HTTP image URL', () => {
    expect(
      getPreferredGameImage(
        'https://media.rawg.io/first.jpg',
        'https://media.rawg.io/second.jpg'
      )
    ).toBe('https://media.rawg.io/first.jpg')
  })

  it('skips empty and whitespace-only URLs', () => {
    expect(
      getPreferredGameImage('', '   ', 'https://media.rawg.io/game.jpg')
    ).toBe('https://media.rawg.io/game.jpg')
  })

  it('uses the screenshot when the background image is unavailable', () => {
    expect(
      getPreferredGameImage(null, undefined, 'https://media.rawg.io/screenshot.jpg')
    ).toBe('https://media.rawg.io/screenshot.jpg')
  })

  it('uses the local fallback when no valid image URL is available', () => {
    expect(getPreferredGameImage(null, '', 'data:image/png;base64,invalid')).toBe(
      GAME_IMAGE_FALLBACK
    )
  })
})
