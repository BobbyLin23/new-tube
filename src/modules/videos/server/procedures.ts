import { TRPCError } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { videos, videoUpdateSchema } from '@/db/schema'
import { mux } from '@/lib/mux'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id } = ctx.user

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: id,
        playback_policy: ['public'],
        input: [
          {
            generated_subtitles: [
              {
                language_code: 'en',
                name: 'English',
              },
            ],
          },
        ],
      },
      cors_origin: '*',
    })

    const [video] = await db
      .insert(videos)
      .values({
        userId: id,
        title: 'Untitled',
        muxStatus: 'waiting',
        muxUploadId: upload.id,
      })
      .returning()

    return {
      video,
      url: upload.url,
    }
  }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      if (!input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()

      if (!updatedVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return updatedVideo
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      if (!input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const [video] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()

      if (!video) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return video
    }),
})
