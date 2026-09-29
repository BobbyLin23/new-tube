<script setup lang="ts">
import { formatDuration } from "@/lib/utils";

interface VideoThumbnailProps {
  title: string;
  duration: number;
  imageUrl?: string | null;
  previewUrl?: string | null;
}

const props = defineProps<VideoThumbnailProps>();
</script>

<template>
  <div class="group relative">
    <!-- Thumbnail wrapper -->
    <div class="relative aspect-video w-full overflow-hidden rounded-xl">
      <NuxtImg
        class="h-full w-full object-cover transition-opacity group-hover:opacity-0"
        :src="props.imageUrl ?? '/placeholder.svg'"
        :alt="props.title"
      />
      <NuxtImg
        class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity group-hover:opacity-100"
        :src="props.previewUrl ?? '/placeholder.svg'"
        :alt="props.title"
      />
    </div>

    <!-- Video duration box -->
    <div
      class="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white"
    >
      {{ formatDuration(props.duration) }}
    </div>
  </div>
</template>
