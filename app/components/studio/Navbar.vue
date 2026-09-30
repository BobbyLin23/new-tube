<script setup lang="ts"></script>

<template>
  <nav
    class="fixed bg-background top-0 left-0 right-0 h-16 flex items-center px-2 pr-5 z-50 border-b shadow-md"
  >
    <div class="flex items-center gap-4 w-full">
      <div class="flex items-center shrink-0">
        <SidebarTrigger />
        <NuxtLink href="/studio">
          <div class="p-4 flex items-center gap-1">
            <NuxtImg src="/logo.svg" alt="Logo" :width="32" :height="32" />
            <p class="text-xl font-semibold tracking-tight">Studio</p>
          </div>
        </NuxtLink>
      </div>

      <div class="flex-1" />

      <div class="shrink-0 items-center flex gap-4">
        <StudioUploadModal />
        <AuthButton />
      </div>
    </div>
  </nav>
</template>
