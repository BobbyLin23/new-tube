<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = defineProps<{
  videoId: string;
}>();

const orpc = useOrpc();
const queryCache = useQueryCache();

const { isSignedIn } = useAuth();

const {
  data: video,
  isPending,
  isLoading,
  refetch,
} = useQuery(() =>
  orpc.videos.getOne.queryOptions({
    input: {
      id: props.videoId,
    },
    ssrCatchError: true,
  }),
);

const isProcessing = computed(
  () => video.value?.muxStatus === "waiting" || video.value?.muxStatus === "preparing",
);

const { mutate: recordView } = useMutation(
  orpc.videoViews.create.mutationOptions({
    onSuccess: (_view, { videoId }) => {
      return queryCache.invalidateQueries({
        key: orpc.videos.getOne.queryKey({ input: { id: videoId } }),
        exact: true,
      });
    },
  }),
);

function handlePlay(videoId: string) {
  if (!isSignedIn.value) return;

  recordView({ videoId });
}
</script>

<template>
  <div v-if="isPending" role="status" aria-label="Loading video" class="space-y-4">
    <Skeleton class="aspect-video w-full rounded-xl" />
    <Skeleton class="h-7 w-3/4" />
    <Skeleton class="h-10 w-1/2" />
  </div>
  <template v-else-if="video">
    <div
      :class="
        cn(
          'aspect-video bg-black rounded-xl overflow-hidden relative',
          isProcessing && 'rounded-b-none',
        )
      "
    >
      <VideoPlayer
        v-if="video.muxStatus === 'ready' && video.muxPlaybackId"
        :key="video.id"
        autoPlay
        :playbackId="video.muxPlaybackId"
        :thumbnailUrl="video.thumbnailUrl"
        @play="handlePlay(video.id)"
      />
      <div v-else class="flex h-full items-center justify-center p-4 text-center text-white">
        <p v-if="isProcessing" role="status">Your video is being processed.</p>
        <p v-else role="alert">This video is currently unavailable.</p>
      </div>
    </div>
    <VideoBanner v-if="isProcessing" :status="video.muxStatus" />
    <VideoTopRow :video="video" />
  </template>
  <div
    v-else
    class="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border p-6"
  >
    <p role="alert" class="text-muted-foreground">Unable to load this video.</p>
    <Button variant="secondary" :disabled="isLoading" @click="refetch()">Try again</Button>
  </div>
</template>
