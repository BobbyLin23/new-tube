<template>
  <div role="status" aria-label="Loading video details" class="space-y-6">
    <span class="sr-only">Loading video details...</span>
    <div class="flex items-center justify-between">
      <div class="space-y-2">
        <Skeleton class="h-7 w-32" />
        <Skeleton class="h-4 w-40" />
      </div>
      <Skeleton class="h-9 w-24" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6" aria-hidden="true">
      <div class="space-y-8 lg:col-span-3">
        <div class="space-y-2">
          <Skeleton class="h-5 w-16" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="h-5 w-24" />
          <Skeleton class="h-55 w-full" />
        </div>
        <Skeleton class="h-21 w-38.25" />
        <div class="space-y-2">
          <Skeleton class="h-5 w-20" />
          <Skeleton class="h-10 w-full" />
        </div>
      </div>
      <div class="space-y-8 lg:col-span-2">
        <div class="rounded-xl overflow-hidden bg-sidebar">
          <Skeleton class="aspect-video w-full" />
          <div class="p-4 space-y-6">
            <div v-for="item in 3" :key="item" class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-5 w-full" />
            </div>
          </div>
        </div>
        <Skeleton class="h-10 w-full" />
      </div>
    </div>
  </div>
</template>
