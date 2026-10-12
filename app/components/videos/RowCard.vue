<script setup lang="ts">
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

const rowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: { size: "default" },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-42",
    },
  },
  defaultVariants: { size: "default" },
});

const props = withDefaults(
  defineProps<{
    data: VideoGetManyOutput["items"][number];
    size?: "default" | "compact";
    onRemove?: () => void;
  }>(),
  { size: "default" },
);

const compact = new Intl.NumberFormat("en", { notation: "compact" });
const compactViews = computed(() => compact.format(props.data.viewCount));
const compactLikes = computed(() => compact.format(props.data.likeCount));
</script>

<template>
  <div :class="rowCardVariants({ size })">
    <NuxtLink :href="`/videos/${data.id}`" :class="thumbnailVariants({ size })">
      <VideosThumbnail
        :imageUrl="data.thumbnailUrl"
        :previewUrl="data.previewUrl"
        :title="data.title"
        :duration="data.duration || 0"
      />
    </NuxtLink>
    <div class="min-w-0 flex-1">
      <div class="flex justify-between gap-x-2">
        <NuxtLink :href="`/videos/${data.id}`" class="min-w-0 flex-1">
          <h3 :class="cn('font-medium line-clamp-2', size === 'compact' ? 'text-sm' : 'text-base')">
            {{ data.title }}
          </h3>
          <template v-if="size === 'default'">
            <p class="mt-1 text-xs text-muted-foreground">
              {{ compactViews }} views • {{ compactLikes }} likes
            </p>
            <div class="my-3 flex items-center gap-2">
              <UserAvatar size="sm" :imageUrl="data.user.imageUrl" :name="data.user.name" />
              <UserInfo size="sm" :name="data.user.name" />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <p class="w-fit text-xs text-muted-foreground line-clamp-2">
                  {{ data.description ?? "No description" }}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" class="bg-black/70">
                <p>From the video description</p>
              </TooltipContent>
            </Tooltip>
          </template>
          <template v-else>
            <UserInfo size="sm" :name="data.user.name" />
            <p class="mt-1 text-xs text-muted-foreground">
              {{ compactViews }} views • {{ compactLikes }} likes
            </p>
          </template>
        </NuxtLink>
        <div class="flex-none">
          <VideoMenu :videoId="data.id" :onRemove="onRemove" />
        </div>
      </div>
    </div>
  </div>
</template>
