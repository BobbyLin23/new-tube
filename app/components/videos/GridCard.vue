<script setup lang="ts">
defineProps<{
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}>();
</script>

<template>
  <div class="group flex w-full flex-col gap-2">
    <NuxtLink :href="`/videos/${data.id}`">
      <VideosThumbnail
        :imageUrl="data.thumbnailUrl"
        :previewUrl="data.previewUrl"
        :title="data.title"
        :duration="data.duration || 0"
      />
    </NuxtLink>
    <VideosInfo :data="data" :onRemove="onRemove" />
  </div>
</template>
