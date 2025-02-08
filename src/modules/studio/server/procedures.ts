import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { and, desc, eq, lt, or } from 'drizzle-orm'

import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { db } from '@/db'
import { videos } from '@/db/schema'

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user
      const { id } = input
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)))

      if (!video) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return video
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const { user } = ctx

      const studios = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, user.id),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1)
      const hasMore = studios.length > limit
      const items = hasMore ? studios.slice(0, -1) : studios
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null

      return {
        items,
        nextCursor,
      }
    }),
})
