<script setup lang="ts">
import { DEFAULT_LIMIT } from "~/lib/constants";

const props = defineProps<{
  query?: string;
  categoryId?: string;
}>();

const orpc = useOrpc();

type SearchCursor = { id: string; updatedAt: Date };

const { data, hasNextPage, loadNextPage, isPending, error } = useInfiniteQuery(() =>
  orpc.search.getMany.infiniteOptions<SearchCursor | undefined>({
    input: (cursor) => ({
      query: props.query,
      categoryId: props.categoryId,
      limit: DEFAULT_LIMIT,
      cursor,
    }),
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

const results = computed(() => (data.value?.pages ?? []).flatMap((page) => page.items));

// Keep already loaded pages visible when only a "load more" request fails.
const hasResults = computed(() => results.value.length > 0);
</script>

<template>
  <div v-if="error && !hasResults" role="alert" class="py-6">
    <p class="text-sm text-destructive">Unable to load search results.</p>
  </div>
  <div v-else-if="isPending" role="status">
    <div class="hidden md:block space-y-3">
      <VideosRowCardSkeleton v-for="i in 6" :key="i" />
    </div>
    <div class="block md:hidden space-y-10">
      <VideosGridCardSkeleton v-for="i in 6" :key="i" />
    </div>
  </div>
  <template v-else>
    <div class="hidden md:block space-y-4">
      <VideosRowCard v-for="video in results" :key="video.id" :data="video" />
    </div>
    <div class="block md:hidden space-y-10">
      <VideosGridCard v-for="video in results" :key="video.id" :data="video" />
    </div>
    <InfiniteScroll
      :hasNextPage="hasNextPage"
      :isFetchingNextPage="isFetchingNextPage"
      @load-more="loadMore"
    />
  </template>
</template>
