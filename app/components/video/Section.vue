<script lang="ts" setup>
import { cn } from "~/lib/utils";

const props = defineProps<{
  videoId: string;
}>();

const orpc = useOrpc();

const { data: video } = useQuery(
  orpc.videos.getOne.queryOptions({
    input: {
      id: props.videoId,
    },
  }),
);
</script>

<template>
  <div
    :class="
      cn(
        'aspect-video bg-black rounded-xl overflow-hidden relative',
        video?.muxStatus !== 'ready' && 'rounded-b-none',
      )
    "
  >
    <VideoPlayer
      autoPlay
      :playbackId="video?.muxPlaybackId"
      :thumbnailUrl="video?.thumbnailUrl"
      @play="() => {}"
    />
  </div>
  <VideoBanner :status="video?.muxStatus" />
  <VideoTopRow :video="video!" />
</template>
