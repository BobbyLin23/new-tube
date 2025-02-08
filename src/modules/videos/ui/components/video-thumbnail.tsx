import Image from 'next/image'

import { formatDuration } from '@/lib/utils'
import { THUMBNAIL_FALLBACK } from '../../constants'

interface VideoThumbnailProps {
  imageUrl?: string | null
  previewUrl?: string | null
  title: string
  duration: number
}

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="group relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-0"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-100"
        />
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {formatDuration(duration)}
      </div>
    </div>
  )
}
