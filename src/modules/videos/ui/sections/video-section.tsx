import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuth } from '@clerk/nextjs'

import { trpc } from '@/trpc/client'
import { cn } from '@/lib/utils'

import { VideoPlayer } from '../components/video-player'
import { VideoBanner } from '../components/video-banner'
import { VideoTopRow } from '../components/video-top-row'

interface VideoSectionProps {
  videoId: string
}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const { isSignedIn } = useAuth()

  const utils = trpc.useUtils()
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId })

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId })
    },
  })

  const handlePlay = () => {
    if (!isSignedIn) return

    createView.mutate({ videoId })
  }

  return (
    <>
      <div
        className={cn(
          'relative aspect-video overflow-hidden rounded-xl bg-black',
          video.muxStatus !== 'ready' && 'rounded-b-none',
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  )
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<p></p>}>
      <ErrorBoundary fallback={<p></p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}
