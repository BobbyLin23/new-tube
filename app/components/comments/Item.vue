<script setup lang="ts">
import { formatDistanceToNow } from "date-fns";

const props = defineProps<{
  comment: CommentsGetManyOutput[number];
}>();

const createdAt = computed(() => formatDistanceToNow(props.comment.createdAt, { addSuffix: true }));
</script>

<template>
  <div class="flex gap-4">
    <NuxtLink :href="`/user/${comment.userId}`">
      <UserAvatar size="lg" :imageUrl="comment.user.imageUrl" :name="comment.user.name" />
    </NuxtLink>
    <div class="flex-1 min-w-0">
      <NuxtLink :href="`/user/${comment.userId}`">
        <div class="mb-0.5 flex items-center gap-2">
          <span class="pb-0.5 text-sm font-medium">{{ comment.user.name }}</span>
          <span class="text-xs text-muted-foreground">{{ createdAt }}</span>
        </div>
      </NuxtLink>
      <p class="text-sm whitespace-pre-wrap wrap-break-word">{{ comment.value }}</p>
    </div>
  </div>
</template>
