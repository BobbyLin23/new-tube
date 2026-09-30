<script lang="ts" setup>
definePageMeta({
  layout: "default",
});

const route = useRoute();

const videoId = computed(() => route.params.videoId as string);
</script>

<template>
  <div class="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
    <div class="flex flex-col xl:flex-row gap-6">
      <div class="flex-1 min-w-0">
        <VideoSection :videoId="videoId" />
        <div class="xl:hidden block mt-4">
          <SuggestionsSection />
        </div>
        <CommentsSection />
      </div>
      <div class="hidden xl:block w-full xl:w-95 2xl:w-115 shrink">
        <SuggestionsSection />
      </div>
    </div>
  </div>
</template>
