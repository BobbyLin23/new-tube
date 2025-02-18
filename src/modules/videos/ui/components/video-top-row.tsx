import { useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'

import { VideoMenu } from './video-menu'
import { VideoOwner } from './video-owner'
import { VideoReactions } from './video-reactions'
import { VideoDescription } from './video-description'

import { VideoGetOneOutput } from '../../types'

export const VideoTopRow = ({ video }: { video: VideoGetOneOutput }) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
    }).format(video.videoCount)
  }, [video.videoCount])

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat('en-US', {
      notation: 'standard',
    }).format(video.videoCount)
  }, [video.videoCount])

  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true })
  }, [video.createdAt])

  const expandedDate = useMemo(() => {
    return format(video.createdAt, 'do MMM yyyy')
  }, [video.createdAt])

  return (
    <div className="mt-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="-mb-2 flex gap-2 overflow-x-auto pb-2 sm:mb-0 sm:min-w-[calc(50%-7px)] sm:justify-end sm:overflow-visible sm:pb-0">
          <VideoReactions />
          <VideoMenu
            videoId={video.id}
            variant="secondary"
            onRemove={() => {}}
          />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  )
}
