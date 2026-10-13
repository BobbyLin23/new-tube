<script setup lang="ts">
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

withDefaults(
  defineProps<{
    size?: "default" | "compact";
  }>(),
  { size: "default" },
);

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
</script>

<template>
  <div :class="rowCardVariants({ size })">
    <div :class="thumbnailVariants({ size })">
      <VideosThumbnailSkeleton />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex justify-between gap-x-2">
        <div class="min-w-0 flex-1">
          <Skeleton :class="cn('h-5 w-[40%]', size === 'compact' && 'h-4 w-[40%]')" />
          <template v-if="size === 'default'">
            <Skeleton class="mt-1 h-4 w-[20%]" />
            <div class="my-3 flex items-center gap-2">
              <Skeleton class="size-8 rounded-full" />
              <Skeleton class="h-4 w-24" />
            </div>
          </template>
          <template v-else>
            <Skeleton class="mt-1 h-4 w-[50%]" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
