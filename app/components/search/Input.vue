<script setup lang="ts">
import { RiSearchLine } from "@remixicon/vue";
import { XIcon } from "@lucide/vue";

const route = useRoute();

const value = ref(typeof route.query.query === "string" ? route.query.query : "");

watch(
  () => route.query.query,
  (query) => {
    value.value = typeof query === "string" ? query : "";
  },
);

function onSubmit() {
  const newQuery = value.value.trim();
  value.value = newQuery;
  navigateTo({ path: "/search", query: newQuery ? { query: newQuery } : {} });
}
</script>

<template>
  <form class="flex w-full max-w-150" @submit.prevent="onSubmit">
    <div class="relative w-full">
      <input
        v-model="value"
        type="text"
        placeholder="Search"
        class="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500 focus:inset-ring-1 focus:inset-ring-blue-500"
      />
      <Button
        v-if="value"
        type="button"
        variant="ghost"
        size="icon"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
        @click="value = ''"
      >
        <XIcon class="text-gray-500" />
      </Button>
    </div>
    <button
      type="submit"
      :disabled="!value.trim()"
      class="px-5 py-2.5 border border-l-0 rounded-r-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RiSearchLine class="size-5" />
    </button>
  </form>
</template>
