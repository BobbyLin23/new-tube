<script setup lang="ts">
import { toast } from "vue-sonner";

const props = withDefaults(
  defineProps<{
    videoId: string;
    parentId?: string;
    variant?: "comment" | "reply";
  }>(),
  { variant: "comment" },
);

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const orpc = useOrpc();
const queryCache = useQueryCache();
const { user } = useUser();
const clerk = useClerk();

const value = ref("");

const { mutate, isLoading } = useMutation(
  orpc.comments.create.mutationOptions({
    onSuccess: () => {
      queryCache.invalidateQueries({ key: orpc.comments.getMany.key() });
      value.value = "";
      toast.success("Comment added");
      emit("success");
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if ("code" in error && error.code === "UNAUTHORIZED") {
        clerk.value?.openSignIn();
      }
    },
  }),
);

function onSubmit() {
  const trimmed = value.value.trim();
  if (!trimmed || isLoading.value) return;
  mutate({ videoId: props.videoId, parentId: props.parentId, value: trimmed });
}

function onCancel() {
  value.value = "";
  emit("cancel");
}
</script>

<template>
  <form class="flex gap-4" @submit.prevent="onSubmit">
    <UserAvatar
      size="lg"
      :imageUrl="user?.imageUrl || '/user-placeholder.svg'"
      :name="user?.username || 'User'"
    />
    <div class="flex-1">
      <Textarea
        v-model="value"
        maxlength="2000"
        :placeholder="variant === 'reply' ? 'Reply to this comment...' : 'Add a comment...'"
        class="resize-none bg-transparent overflow-hidden min-h-0"
      />
      <div class="mt-2 flex justify-end gap-2">
        <Button v-if="variant === 'reply'" variant="ghost" type="button" @click="onCancel">
          Cancel
        </Button>
        <Button type="submit" size="sm" :disabled="isLoading || !value.trim()">
          {{ variant === "reply" ? "Reply" : "Comment" }}
        </Button>
      </div>
    </div>
  </form>
</template>
