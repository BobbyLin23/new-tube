<script lang="ts" setup>
import { format, formatDistanceToNow } from "date-fns";

const props = defineProps<{
  video: VideoGetOneOutput;
}>();

const compactViews = computed(() => {
  return Intl.NumberFormat("en", {
    notation: "compact",
  }).format(props.video.viewCount);
});

const expandedViews = computed(() => {
  return Intl.NumberFormat("en", {
    notation: "standard",
  }).format(props.video.viewCount);
});

const compactDate = computed(() => {
  return formatDistanceToNow(props.video.createdAt, { addSuffix: true });
});
const expandedDate = computed(() => {
  return format(props.video.createdAt, "d MMM yyyy");
});
</script>

<template>
  <div class="flex flex-col gap-4 mt-4">
    <h1 class="text-xl font-semibold">{{ video.title }}</h1>
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <VideoOwner :user="video.user" :videoId="video.id" />
      <div
        class="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2"
      >
        <VideoReactions />
        <VideoMenu :videoId="video.id" variant="secondary" />
      </div>
    </div>
    <VideoDescription
      :compactViews="compactViews"
      :expandedViews="expandedViews"
      :compactDate="compactDate"
      :expandedDate="expandedDate"
      :description="video.description"
    />
  </div>
</template>
