<script setup lang="ts">
import { DEFAULT_LIMIT } from "~/lib/constants";

const orpc = useOrpc();

type StudioCursor = { id: string; updatedAt: Date };

const { data, hasNextPage, loadNextPage } = useInfiniteQuery(() =>
  orpc.studio.list.infiniteOptions<StudioCursor | undefined>({
    input: (cursor) => ({ limit: DEFAULT_LIMIT, cursor }),
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

const videos = computed(() => {
  return (data.value?.pages ?? []).flatMap((page) => page.items);
});
</script>

<template>
  <div>
    <div class="border-y">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="pl-6 w-127.5">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead class="text-right">Views</TableHead>
            <TableHead class="text-right">Comments</TableHead>
            <TableHead class="text-right pr-6">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <NuxtLink v-for="video in videos" :href="`/studio/videos/${video.id}`" :key="video.id">
            <TableRow class="cursor-pointer">
              <TableCell> {{ video.title }} </TableCell>
              <TableCell> visibility </TableCell>
              <TableCell> status </TableCell>
              <TableCell> date </TableCell>
              <TableCell> views </TableCell>
              <TableCell> comments </TableCell>
              <TableCell> likes </TableCell>
            </TableRow>
          </NuxtLink>
        </TableBody>
      </Table>
    </div>
    <InfiniteScroll
      isManual
      :has-next-page="hasNextPage"
      :is-fetching-next-page="isFetchingNextPage"
      @load-more="loadMore"
    />
  </div>
</template>
