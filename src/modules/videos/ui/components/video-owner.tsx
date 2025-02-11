'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

import { SubscriptionButton } from '@/modules/subscriptions/ui/components/subscription-button'
import { UserInfo } from '@/modules/users/ui/components/user-info'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'

import { VideoGetOneOutput } from '../../types'

export const VideoOwner = ({
  user,
  videoId,
}: {
  user: VideoGetOneOutput['user']
  videoId: string
}) => {
  const { userId: clerkUserId } = useAuth()

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 sm:items-start sm:justify-start">
      <Link href={`/users/${user.id}`}>
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar size="lg" imageUrl={user.imageUrl} name={user.name} />
          <div className="flex min-w-0 flex-col gap-1">
            <UserInfo name={user.name} size="lg" />
            <span className="line-clamp-1 text-sm text-muted-foreground">
              {0} subscribers
            </span>
          </div>
        </div>
      </Link>
      {clerkUserId === user.clerkId ? (
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={() => {}}
          disabled={false}
          isSubscribed={false}
          className="flex-none"
        />
      )}
    </div>
  )
}
