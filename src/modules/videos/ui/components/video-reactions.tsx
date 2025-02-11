import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export const VideoReactions = () => {
  const videoReaction: string = 'like'

  return (
    <div className="flex flex-none items-center">
      <Button className="gap-2 rounded-l-full rounded-r-none pr-4">
        <ThumbsUpIcon
          className={cn('size-5', videoReaction === 'like' && 'fill-black')}
        />
        {1}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button className="rounded-l-none rounded-r-full pl-3">
        <ThumbsDownIcon
          className={cn('size-5', videoReaction === 'dislike' && 'fill-black')}
        />
        {1}
      </Button>
    </div>
  )
}
