'use client'

import { DEFAULT_LIMIT } from '@/constants'
import { trpc } from '@/trpc/client'

export const VideoSection = () => {
  const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor
      },
    },
  )

  return <div>{JSON.stringify(data)}</div>
}
