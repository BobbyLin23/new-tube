<script setup lang="ts">
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "@lucide/vue";

const items = [
  {
    title: "History",
    url: "/playlists/history",
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: "Liked videos",
    url: "/playlists/liked",
    icon: ThumbsUpIcon,
    auth: true,
  },
  {
    title: "All playlists",
    url: "/playlists",
    icon: ListVideoIcon,
    auth: true,
  },
];

const clerk = useClerk();
const { isSignedIn } = useAuth();
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton
            :tooltip="item.title"
            asChild
            :isActive="false"
            @click="
              (e: Event) => {
                if (!isSignedIn && item.auth) {
                  e.preventDefault();
                  return clerk?.openSignIn();
                }
              }
            "
          >
            <NuxtLink :href="item.url" class="flex items-center gap-4">
              <component :is="item.icon" />
              <span class="text-sm">{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
