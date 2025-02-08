import { db } from '@/db'
import { videos } from '@/db/schema'
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
})
