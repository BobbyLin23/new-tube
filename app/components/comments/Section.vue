<script lang="ts" setup>
import { DEFAULT_LIMIT } from "~/lib/constants";
import { Loader2Icon } from "@lucide/vue";

const props = defineProps<{
  videoId: string;
}>();

const orpc = useOrpc();

type CommentsCursor = { id: string; updatedAt: Date };

const { data, hasNextPage, loadNextPage, isPending, error } = useInfiniteQuery(() =>
  orpc.comments.getMany.infiniteOptions<CommentsCursor | undefined>({
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

const comments = computed(() => (data.value?.pages ?? []).flatMap((page) => page.items));
const totalCount = computed(() => data.value?.pages[0]?.totalCount ?? 0);
</script>

<template>
  <div class="mt-6">
    <div v-if="isPending" role="status" class="flex items-center justify-center">
      <Loader2Icon class="size-7 animate-spin text-muted-foreground" />
    </div>
    <div v-else class="flex flex-col gap-6">
      <h2 class="text-xl font-bold">{{ totalCount }} Comments</h2>
      <CommentsForm :videoId="videoId" />
      <p v-if="error" role="alert" class="text-sm text-destructive">Unable to load comments.</p>
      <div v-else class="mt-2 flex flex-col gap-4">
        <CommentsItem v-for="comment in comments" :key="comment.id" :comment="comment" />
        <InfiniteScroll
          isManual
          :hasNextPage="hasNextPage"
          :isFetchingNextPage="isFetchingNextPage"
          @load-more="loadMore"
        />
      </div>
    </div>
  </div>
</template>
