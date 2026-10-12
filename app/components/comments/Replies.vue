<script setup lang="ts">
import { CornerDownRightIcon, Loader2Icon } from "@lucide/vue";
import { DEFAULT_LIMIT } from "~/lib/constants";

const props = defineProps<{
  parentId: string;
  videoId: string;
}>();

const orpc = useOrpc();

type CommentsCursor = { id: string; updatedAt: Date };

const { data, hasNextPage, loadNextPage, isPending } = useInfiniteQuery(() =>
  orpc.comments.getMany.infiniteOptions<CommentsCursor | undefined>({
    input: (cursor) => ({
      videoId: props.videoId,
      parentId: props.parentId,
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

const replies = computed(() => (data.value?.pages ?? []).flatMap((page) => page.items));
</script>

<template>
  <div class="pl-14">
    <div class="mt-2 flex flex-col gap-4">
      <div v-if="isPending" role="status" class="flex items-center justify-center">
        <Loader2Icon class="size-6 animate-spin text-muted-foreground" />
      </div>
      <CommentsItem
        v-for="reply in replies"
        v-else
        :key="reply.id"
        :comment="reply"
        variant="reply"
      />
    </div>
    <Button
      v-if="hasNextPage"
      variant="tertiary"
      size="sm"
      :disabled="isFetchingNextPage"
      @click="loadMore"
    >
      <CornerDownRightIcon />
      Show more replies
    </Button>
  </div>
</template>
