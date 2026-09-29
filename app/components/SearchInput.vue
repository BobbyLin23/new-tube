<script setup lang="ts">
import { RiSearchLine } from "@remixicon/vue";
</script>

<template>
  <form class="flex w-full max-w-150">
    <div class="relative w-full">
      <input
        type="text"
        placeholder="Search"
        class="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
      />
    </div>
    <button
      type="submit"
      class="px-5 py-2.5 border border-l-0 rounded-r-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RiSearchLine class="size-5" />
    </button>
  </form>
</template>
