<script setup lang="ts">
const {
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
} = defineProps<{
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}>();

const emit = defineEmits<{ "load-more": [] }>();

const isIntersecting = ref(false);
const target = useTemplateRef<HTMLElement>("target");

useIntersectionObserver(
  target,
  ([entry]) => {
    isIntersecting.value = entry?.isIntersecting ?? false;
  },
  { threshold: 0.5, rootMargin: "100px" },
);

watchEffect(() => {
  if (isIntersecting.value && hasNextPage && !isFetchingNextPage && !isManual) {
    emit("load-more");
  }
});
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4">
    <div ref="target" class="h-1" />
    <Button
      v-if="hasNextPage"
      variant="secondary"
      :disabled="isFetchingNextPage"
      @click="emit('load-more')"
    >
      {{ isFetchingNextPage ? "Loading..." : "Load more" }}
    </Button>
    <p v-else class="text-xs text-muted-foreground">You have reached the end of the list</p>
  </div>
</template>
