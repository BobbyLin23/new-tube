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

function handleNavigation(event: MouseEvent, requiresAuth = false) {
  if (requiresAuth && !isSignedIn.value) {
    event.preventDefault();
    clerk.value?.openSignIn();
  }
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton :tooltip="item.title" asChild :isActive="false">
            <NuxtLink
              :href="item.url"
              class="flex items-center gap-4"
              @click.capture="handleNavigation($event, item.auth)"
            >
              <component :is="item.icon" />
              <span class="text-sm">{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
