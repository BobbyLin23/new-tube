<script setup lang="ts">
import { DEFAULT_LIMIT } from "~/lib/constants";
import { snakeCaseToTitle } from "~/lib/utils";
import { Globe2Icon, LockIcon } from "@lucide/vue";
import { format } from "date-fns";

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
          <TableRow
            v-for="video in videos"
            :key="video.id"
            class="cursor-pointer"
            tabindex="0"
            @click="navigateTo(`/studio/videos/${video.id}`)"
            @keydown.enter="navigateTo(`/studio/videos/${video.id}`)"
          >
            <TableCell>
              <NuxtLink
                :href="`/studio/videos/${video.id}`"
                class="flex items-center gap-4 focus-visible:outline-none"
              >
                <div class="relative aspect-video w-36 shrink-0">
                  <VideosThumbnail
                    :imageUrl="video.thumbnailUrl"
                    :previewUrl="video.previewUrl"
                    :title="video.title"
                    :duration="video.duration || 0"
                  />
                </div>
                <div class="flex flex-col overflow-hidden gap-y-1">
                  <span class="text-sm line-clamp-1">{{ video.title }}</span>
                  <span class="text-xs text-muted-foreground line-clamp-1">
                    {{ video.description || "No description" }}
                  </span>
                </div>
              </NuxtLink>
            </TableCell>
            <TableCell>
              <div class="flex items-center">
                <LockIcon v-if="video.visibility === 'private'" class="size-4 mr-2" />
                <Globe2Icon v-else class="size-4 mr-2" />
                {{ snakeCaseToTitle(video.visibility) }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center">
                {{ snakeCaseToTitle(video.muxStatus || "error") }}
              </div>
            </TableCell>
            <TableCell class="text-sm truncate">
              {{ format(new Date(video.createdAt), "d MMM yyyy") }}
            </TableCell>
            <TableCell> views </TableCell>
            <TableCell> comments </TableCell>
            <TableCell class="text-right"> likes </TableCell>
          </TableRow>
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
