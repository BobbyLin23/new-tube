<script lang="ts" setup>
import { DEFAULT_LIMIT } from "~/lib/constants";

const props = defineProps<{
  videoId: string;
  isManual?: boolean;
}>();

const orpc = useOrpc();

type SuggestionsCursor = { id: string; updatedAt: Date };

const { data, hasNextPage, loadNextPage, isPending } = useInfiniteQuery(() =>
  orpc.suggestions.getMany.infiniteOptions<SuggestionsCursor | undefined>({
    input: (cursor) => ({ videoId: props.videoId, limit: DEFAULT_LIMIT, cursor }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }),
);

const isFetchingNextPage = ref(false);

async function loadMore() {
  if (isFetchingNextPage.value) return;

  isFetchingNextPage.value = true;
  try {
    await loadNextPage();
  } finally {
    isFetchingNextPage.value = false;
  }
}

const suggestions = computed(() => (data.value?.pages ?? []).flatMap((page) => page.items));
</script>

<template>
  <div v-if="isPending" role="status">
    <div class="hidden md:block space-y-3">
      <VideosRowCardSkeleton v-for="i in 6" :key="i" size="compact" />
    </div>
    <div class="block md:hidden space-y-10">
      <VideosGridCardSkeleton v-for="i in 6" :key="i" />
    </div>
  </div>
  <template v-else>
    <div class="hidden md:block space-y-3">
      <VideosRowCard v-for="video in suggestions" :key="video.id" :data="video" size="compact" />
    </div>
    <div class="block md:hidden space-y-10">
      <VideosGridCard v-for="video in suggestions" :key="video.id" :data="video" />
    </div>
    <InfiniteScroll
      :isManual="isManual"
      :hasNextPage="hasNextPage"
      :isFetchingNextPage="isFetchingNextPage"
      @load-more="loadMore"
    />
  </template>
</template>
