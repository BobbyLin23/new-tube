<script setup lang="ts">
import "@mux/mux-player";
import { THUMBNAIL_FALLBACK } from "~/lib/constants";

interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
}

const props = defineProps<VideoPlayerProps>();

const emit = defineEmits<{ play: [] }>();
</script>

<template>
  <mux-player
    :playback-id="props.playbackId ?? ''"
    :poster="props.thumbnailUrl || THUMBNAIL_FALLBACK"
    :player-init-time="0"
    :auto-play="props.autoPlay"
    :thumbnail-time="0"
    class="w-full h-full object-contain"
    accent-color="#FF2056"
    @play="emit('play')"
  />
</template>

<style scoped></style>
