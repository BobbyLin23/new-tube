<script setup lang="ts">
const route = useRoute();

const query = computed(() =>
  typeof route.query.query === "string" ? route.query.query : undefined,
);

const categoryId = computed(() =>
  typeof route.query.categoryId === "string" ? route.query.categoryId : undefined,
);
</script>

<template>
  <div class="max-w-325 mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
    <CategoriesSection :categoryId="categoryId" />
    <SearchResultsSection :query="query" :categoryId="categoryId" />
  </div>
</template>
