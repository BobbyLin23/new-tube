import { z } from 'zod'
import { and, eq } from 'drizzle-orm'

import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { db } from '@/db'
import { videoReactions } from '@/db/schema'

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input
      const { id: userId } = ctx.user

      const [existingVideoReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, 'like'),
          ),
        )

      if (existingVideoReaction) {
        const [deleteViewerReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId),
            ),
          )
          .returning()

        return deleteViewerReaction
      }

      const [createVideoReaction] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: 'like',
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: 'like',
          },
        })
        .returning()

      return createVideoReaction
    }),
  dislike: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input
      const { id: userId } = ctx.user

      const [existingVideoReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, 'dislike'),
          ),
        )

      if (existingVideoReaction) {
        const [deleteViewerReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId),
            ),
          )
          .returning()

        return deleteViewerReaction
      }

      const [createVideoReaction] = await db
        .insert(videoReactions)
        .values({
          userId,
          videoId,
          type: 'dislike',
        })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: 'dislike',
          },
        })
        .returning()

      return createVideoReaction
    }),
})
