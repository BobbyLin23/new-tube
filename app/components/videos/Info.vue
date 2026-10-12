<script setup lang="ts">
import { formatDistanceToNow } from "date-fns";

const props = defineProps<{
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}>();

const compactViews = computed(() =>
  Intl.NumberFormat("en", { notation: "compact" }).format(props.data.viewCount),
);
const compactDate = computed(() => formatDistanceToNow(props.data.createdAt, { addSuffix: true }));
</script>

<template>
  <div class="flex gap-3">
    <NuxtLink :href="`/users/${data.user.id}`">
      <UserAvatar :imageUrl="data.user.imageUrl" :name="data.user.name" />
    </NuxtLink>
    <div class="min-w-0 flex-1">
      <NuxtLink :href="`/videos/${data.id}`">
        <h3 class="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
          {{ data.title }}
        </h3>
      </NuxtLink>
      <NuxtLink :href="`/users/${data.user.id}`">
        <UserInfo :name="data.user.name" />
      </NuxtLink>
      <NuxtLink :href="`/videos/${data.id}`">
        <p class="text-sm text-muted-foreground line-clamp-1">
          {{ compactViews }} views • {{ compactDate }}
        </p>
      </NuxtLink>
    </div>
    <div class="shrink-0">
      <VideoMenu :videoId="data.id" :onRemove="props.onRemove" />
    </div>
  </div>
</template>
