<script setup lang="ts">
import { PlusIcon, LoaderCircleIcon } from "@lucide/vue";
import { toast } from "vue-sonner";

const orpc = useOrpc();

const queryCache = useQueryCache();

const {
  mutate: create,
  isLoading,
  data,
  reset,
} = useMutation(
  orpc.videos.create.mutationOptions({
    onSuccess: () => {
      toast.success("Video created");
      queryCache.invalidateQueries({ key: orpc.studio.list.key() });
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  }),
);

const handleUploadSuccess = () => {
  reset();
  toast.success("Video uploaded");
  queryCache.invalidateQueries({ key: orpc.studio.list.key() });
};
</script>

<template>
  <ResponsiveModal title="Upload a video" :open="!!data?.url" @update:open="() => reset()">
    <StudioUploader v-if="data?.url" :endpoint="data.url" @success="handleUploadSuccess" />
    <LoaderCircleIcon v-else />
  </ResponsiveModal>
  <Button variant="secondary" @click="create" :disabled="isLoading">
    <LoaderCircleIcon v-if="isLoading" class="animate-spin" />
    <PlusIcon v-else />
    Create
  </Button>
</template>
