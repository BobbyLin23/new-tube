<script setup lang="ts">
import { VideoIcon, LogOutIcon } from "@lucide/vue";
const route = useRoute();
</script>

<template>
  <Sidebar class="pt-16 z-40" collapsible="icon">
    <SidebarContent class="bg-background">
      <SidebarGroup>
        <SidebarMenu>
          <StudioSidebarHeader />
          <SidebarMenuItem>
            <SidebarMenuButton :is-active="route.path === '/studio'" tooltip="Content" asChild>
              <NuxtLink href="/studio">
                <VideoIcon class="size-5" />
                <span class="text-sm">Content</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator />
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Exit studio" asChild>
              <NuxtLink href="/">
                <LogOutIcon class="size-5" />
                <span class="text-sm">Exit studio</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
