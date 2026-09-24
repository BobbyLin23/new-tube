<script setup lang="ts"></script>

<template>
  <SidebarProvider>
    <div class="w-full">
      <HomeNavbar />
      <div class="flex min-h-screen pt-16">
        <HomeSidebar />
        <main class="flex-1 overflow-y-auto">
          <slot />
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>
