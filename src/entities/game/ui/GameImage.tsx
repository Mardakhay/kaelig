import { useState, type ImgHTMLAttributes } from 'react'
import { GAME_IMAGE_FALLBACK } from '../lib/gameImage'

interface GameImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src?: string | null
}

export function GameImage({ src, ...imageProps }: GameImageProps) {
  const requestedSource = src?.trim() || GAME_IMAGE_FALLBACK
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const displaySource =
    failedSource === requestedSource ? GAME_IMAGE_FALLBACK : requestedSource

  return (
    <img
      {...imageProps}
      src={displaySource}
      onError={() => setFailedSource(requestedSource)}
    />
  )
}
