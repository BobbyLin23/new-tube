<script lang="ts" setup>
import { ThumbsUpIcon, ThumbsDownIcon } from "@lucide/vue";
import { cn } from "~/lib/utils";

const viewerReaction: "like" | "dislike" = "like";
</script>

<template>
  <div class="flex items-center flex-none">
    <Button variant="secondary" class="rounded-l-full rounded-r-none gap-2 pr-4">
      <ThumbsUpIcon :class="cn('size-5', viewerReaction === 'like' && 'fill-black')" />
      {{ 1 }}
    </Button>
    <Separator orientation="vertical" class="h-7" />
    <Button variant="secondary" class="rounded-l-none rounded-r-full pl-3">
      <ThumbsDownIcon :class="cn('size-5', viewerReaction !== 'like' && 'fill-black')" />
      {{ 1 }}
    </Button>
  </div>
</template>
