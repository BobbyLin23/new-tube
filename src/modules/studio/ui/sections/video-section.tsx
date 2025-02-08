'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { DEFAULT_LIMIT } from '@/constants'
import { trpc } from '@/trpc/client'
import { InfiniteScroll } from '@/components/infinite-scroll'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail'
import { snakeCaseToTitle } from '@/lib/utils'
import { format } from 'date-fns'
import { Globe2, Lock } from 'lucide-react'

const VideoSectionSuspense = () => {
  const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor
      },
    },
  )

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[510px] pl-6">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="pr-6 text-right">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pages
              .flatMap((page) => page.items)
              .map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior
                >
                  <TableRow className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-36 shrink-0">
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl}
                            previewUrl={video.previewUrl}
                            title={video.title}
                            duration={video.duration || 0}
                          />
                        </div>
                        <div className="flex flex-col gap-y-1 overflow-hidden">
                          <span className="line-clamp-1 text-sm">
                            {video.title}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {video.description || 'No description'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {video.visibility === 'private' ? (
                          <Lock className="mr-2 size-4" />
                        ) : (
                          <Globe2 className="mr-2 size-4" />
                        )}
                        {snakeCaseToTitle(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {snakeCaseToTitle(video.muxStatus || 'error')}
                      </div>
                    </TableCell>
                    <TableCell className="truncate text-sm">
                      {format(new Date(video.createdAt), 'd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">views</TableCell>
                    <TableCell className="text-right">comments</TableCell>
                    <TableCell className="pr-6 text-right">likes</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}

export const VideoSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Loading...</p>}>
        <VideoSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}
