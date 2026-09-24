<script setup lang="ts"></script>

<template>
  <nav class="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
    <div class="flex items-center gap-4 w-full">
      <div class="flex items-center shrink-0">
        <SidebarTrigger />
        <NuxtLink href="/">
          <div class="p-4 flex items-center gap-1">
            <NuxtImg src="/logo.svg" alt="Logo" :width="32" :height="32" />
            <p class="text-xl font-semibold tracking-tight">NewTube</p>
          </div>
        </NuxtLink>
      </div>

      <div class="flex-1 flex justify-center max-w-180 mx-auto">
        <SearchInput />
      </div>

      <div class="shrink-0 items-center flex gap-4">
        <AuthButton />
      </div>
    </div>
  </nav>
</template>
