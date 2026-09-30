<script setup lang="ts">
import { useSidebar } from "~/components/ui/sidebar";

const { user } = useUser();
const { state } = useSidebar();
const isMounted = useMounted();
</script>

<template>
  <template v-if="!isMounted || !user">
    <SidebarHeader class="flex items-center justify-center pb-4">
      <Skeleton class="size-28 rounded-full" />
      <div class="flex flex-col items-center mt-2 gap-y-2">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-4 w-25" />
      </div>
    </SidebarHeader>
  </template>
  <template v-else-if="state === 'collapsed'">
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Your profile" asChild>
        <NuxtLink href="/users/current">
          <UserAvatar :imageUrl="user.imageUrl" :name="user.fullName ?? 'User'" size="xs" />
          <span class="text-sm">Your profile</span>
        </NuxtLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </template>
  <template v-else>
    <SidebarHeader class="flex items-center justify-center pb-4">
      <NuxtLink href="/users/current">
        <UserAvatar
          :imageUrl="user.imageUrl"
          :name="user.fullName ?? 'User'"
          class="size-28 hover:opacity-80 transition-opacity"
        />
      </NuxtLink>
      <div class="flex flex-col items-center mt-2 gap-y-1">
        <p class="text-sm font-medium">Your profile</p>
        <p class="text-xs text-muted-foreground">{{ user.fullName }}</p>
      </div>
    </SidebarHeader>
  </template>
</template>
