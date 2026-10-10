<script setup lang="ts">
import { formatDistanceToNow } from "date-fns";
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "@lucide/vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  comment: CommentsGetManyOutput["items"][number];
}>();

const orpc = useOrpc();
const queryCache = useQueryCache();
const clerk = useClerk();
const { userId: clerkUserId } = useAuth();

const createdAt = computed(() => formatDistanceToNow(props.comment.createdAt, { addSuffix: true }));

const { mutate: remove, isLoading: isRemoving } = useMutation(
  orpc.comments.remove.mutationOptions({
    onSuccess: () => {
      toast.success("Comment deleted");
      queryCache.invalidateQueries({ key: orpc.comments.getMany.key() });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if ("code" in error && error.code === "UNAUTHORIZED") {
        clerk.value?.openSignIn();
      }
    },
  }),
);
</script>

<template>
  <div class="flex gap-4">
    <NuxtLink :href="`/user/${comment.userId}`">
      <UserAvatar size="lg" :imageUrl="comment.user.imageUrl" :name="comment.user.name" />
    </NuxtLink>
    <div class="flex-1 min-w-0">
      <NuxtLink :href="`/user/${comment.userId}`">
        <div class="mb-0.5 flex items-center gap-2">
          <span class="pb-0.5 text-sm font-medium">{{ comment.user.name }}</span>
          <span class="text-xs text-muted-foreground">{{ createdAt }}</span>
        </div>
      </NuxtLink>
      <p class="text-sm whitespace-pre-wrap wrap-break-word">{{ comment.value }}</p>
    </div>
    <DropdownMenu :modal="false">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" class="size-8" aria-label="Comment actions">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <MessageSquareIcon class="size-4" />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem
          v-if="comment.user.clerkId === clerkUserId"
          :disabled="isRemoving"
          @select="remove({ id: comment.id })"
        >
          <Trash2Icon class="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
