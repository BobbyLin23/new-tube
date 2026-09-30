<script lang="ts" setup>
import { AlertTriangleIcon } from "@lucide/vue";

defineProps<{
  status: VideoGetOneOutput["muxStatus"] | undefined;
}>();
</script>

<template>
  <div class="bg-yellow-500 py-3 px-4 rounded-b-xl flex items-center gap-2">
    <AlertTriangleIcon class="size-4 text-black shrink-0" />
    <p class="text-xs md:text-sm font-medium text-black line-clamp-1">
      This video is still being processed.
    </p>
  </div>
</template>
