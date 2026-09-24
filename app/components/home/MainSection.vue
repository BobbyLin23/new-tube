<script setup lang="ts">
import { FlameIcon, HomeIcon, PlaySquareIcon } from "@lucide/vue";

const items = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Subscriptions",
    url: "/feed/subscriptions",
    icon: PlaySquareIcon,
    auth: true,
  },
  {
    title: "Trending",
    url: "/feed/trending",
    icon: FlameIcon,
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
