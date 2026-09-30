<script setup lang="ts">
const route = useRoute();

const categoryId = computed(() => route.query.categoryId as string | undefined);
</script>

<template>
  <div class="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
    <CategoriesSection :categoryId="categoryId" />
  </div>
</template>
