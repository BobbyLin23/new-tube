<script setup lang="ts">
definePageMeta({
  layout: "studio",
  middleware: "auth",
});
</script>

<template>
  <div class="flex flex-col gap-y-6 pt-2.5">
    <div class="px-4">
      <h1 class="text-2xl font-bold">Channel content</h1>
      <p class="text-xs text-muted-foreground">Manage your channel content and videos</p>
    </div>
    <Suspense>
      <VideosSection />
      <template #fallback>
        <p>Loading...</p>
      </template>
    </Suspense>
  </div>
</template>
