<script lang="ts" setup>
const props = defineProps<{
  videoId: string;
}>();

const orpc = useOrpc();

const {
  data: comments,
  isPending,
  error,
} = useQuery(() =>
  orpc.comments.getMany.queryOptions({
    input: { videoId: props.videoId },
    ssrCatchError: true,
  }),
);
</script>

<template>
  <div class="mt-6 flex flex-col gap-6">
    <h2 class="text-xl font-bold">{{ comments?.length ?? 0 }} Comments</h2>
    <CommentsForm :videoId="videoId" />
    <p v-if="isPending" role="status" class="text-sm text-muted-foreground">Loading comments...</p>
    <p v-else-if="error" role="alert" class="text-sm text-destructive">Unable to load comments.</p>
    <div v-else class="mt-2 flex flex-col gap-4">
      <CommentsItem v-for="comment in comments" :key="comment.id" :comment="comment" />
    </div>
  </div>
</template>
