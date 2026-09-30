<script lang="ts" setup>
import { ThumbsUpIcon, ThumbsDownIcon } from "@lucide/vue";
import { toast } from "vue-sonner";
import { cn } from "~/lib/utils";

const props = defineProps<{
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput["viewerReaction"];
}>();

const clerk = useClerk();

const orpc = useOrpc();
const queryCache = useQueryCache();

const { mutate: like, isLoading: likeLoading } = useMutation(
  orpc.videoReactions.like.mutationOptions({
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: orpc.videos.getOne.queryKey({
          input: {
            id: props.videoId,
          },
        }),
      });
    },
    onError: (error) => {
      toast.error("Something went wrong");

      if (error.message === "UNAUTHORIZED") {
        clerk.value?.openSignIn();
      }
    },
  }),
);

const { mutate: dislike, isLoading: dislikeLoading } = useMutation(
  orpc.videoReactions.dislike.mutationOptions({
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: orpc.videos.getOne.queryKey({
          input: {
            id: props.videoId,
          },
        }),
      });
    },
    onError: (error) => {
      toast.error("Something went wrong");

      if (error.message === "UNAUTHORIZED") {
        clerk.value?.openSignIn();
      }
    },
  }),
);
</script>

<template>
  <div class="flex items-center flex-none">
    <Button
      variant="secondary"
      class="rounded-l-full rounded-r-none gap-2 pr-4"
      @click="() => like({ videoId })"
      :disabled="likeLoading || dislikeLoading"
    >
      <ThumbsUpIcon :class="cn('size-5', viewerReaction === 'like' && 'fill-black')" />
      {{ likes }}
    </Button>
    <Separator orientation="vertical" class="h-7" />
    <Button
      variant="secondary"
      class="rounded-l-none rounded-r-full pl-3"
      @click="() => dislike({ videoId })"
      :disabled="likeLoading || dislikeLoading"
    >
      <ThumbsDownIcon :class="cn('size-5', viewerReaction !== 'like' && 'fill-black')" />
      {{ dislikes }}
    </Button>
  </div>
</template>
