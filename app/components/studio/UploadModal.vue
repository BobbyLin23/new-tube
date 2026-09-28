<script setup lang="ts">
import { PlusIcon, LoaderCircleIcon } from "@lucide/vue";
import { toast } from "vue-sonner";

const orpc = useOrpc();

const queryCache = useQueryCache();

const { mutate: create, isLoading } = useMutation(
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
</script>

<template>
  <Button variant="secondary" @click="create" :disabled="isLoading">
    <LoaderCircleIcon v-if="isLoading" class="animate-spin" />
    <PlusIcon v-else />
    Create
  </Button>
</template>
