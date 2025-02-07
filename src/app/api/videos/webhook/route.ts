import { db } from '@/db'
import { videos } from '@/db/schema'
import { mux } from '@/lib/mux'
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from '@mux/mux-node/resources/webhooks'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SIGNING_SECRET

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent

export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) {
    throw new Error('Mux signing secret not found')
  }

  const headersPayload = await headers()

  const muxSignature = headersPayload.get('mux-signature')

  if (!muxSignature) {
    return new Response('Mux signature not found', { status: 401 })
  }
  const payload = await request.json()
  const body = JSON.stringify(payload)

  mux.webhooks.verifySignature(
    body,
    {
      'mux-signature': muxSignature,
    },
    SIGNING_SECRET,
  )

  switch (payload as WebhookEvent['type']) {
    case 'video.asset.created': {
      const data = payload.data as VideoAssetCreatedWebhookEvent['data']

      if (!data.upload_id) {
        return new Response('Upload ID not found', { status: 400 })
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break
    }

    case 'video.asset.ready': {
      const data = payload.data as VideoAssetReadyWebhookEvent['data']
      const playbackId = data.playback_ids?.[0].id

      if (!data.upload_id) {
        return new Response('Upload ID not found', { status: 400 })
      }

      if (!playbackId) {
        return new Response('Playback ID not found', { status: 400 })
      }

      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          thumbnailUrl,
        })
        .where(eq(videos.muxAssetId, data.upload_id))
      break
    }

    case 'video.asset.errored':
      return new Response('Video asset errored', { status: 200 })
    case 'video.asset.track.ready':
      return new Response('Video asset track ready', { status: 200 })
    default:
      return new Response('Unknown event', { status: 200 })
  }

  return new Response('Webhook received', { status: 200 })
}
