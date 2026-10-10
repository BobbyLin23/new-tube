<script setup lang="ts">
import { toast } from "vue-sonner";

const props = defineProps<{
  videoId: string;
}>();

const emit = defineEmits<{
  success: [];
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
  mutate({ videoId: props.videoId, value: trimmed });
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
        placeholder="Add a comment..."
        class="resize-none bg-transparent overflow-hidden min-h-0"
      />
      <div class="mt-2 flex justify-end gap-2">
        <Button type="submit" size="sm" :disabled="isLoading || !value.trim()">Comment</Button>
      </div>
    </div>
  </form>
</template>
