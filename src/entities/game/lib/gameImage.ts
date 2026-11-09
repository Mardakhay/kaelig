export const GAME_IMAGE_FALLBACK = '/game-placeholder.svg'

export function getPreferredGameImage(
  ...candidates: Array<string | null | undefined>
): string {
  return (
    candidates
      .map(candidate => candidate?.trim())
      .find(
        (candidate): candidate is string =>
          Boolean(candidate) && /^https?:\/\//i.test(candidate)
      ) ?? GAME_IMAGE_FALLBACK
  )
}
