'use client'

import MuxPlayer from '@mux/mux-player-react'
import { THUMBNAIL_FALLBACK } from '../../constants'

interface VideoPlayerProps {
  playbackId?: string | null
  thumbnailUrl?: string | null
  autoPlay?: boolean
  onPlay?: () => void
}

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId || ''}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="h-full w-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  )
}
