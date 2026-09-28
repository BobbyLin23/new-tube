<script setup lang="ts">
import { UserButton } from "@clerk/nuxt/components";
import { UserCircleIcon, ClapperboardIcon } from "@lucide/vue";
</script>

<template>
  <Show when="signed-in">
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link label="Studio" href="/studio">
          <template #labelIcon>
            <ClapperboardIcon class="size-4" />
          </template>
        </UserButton.Link>
      </UserButton.MenuItems>
    </UserButton>
  </Show>
  <Show when="signed-out">
    <SignInButton mode="modal">
      <Button
        variant="outline"
        class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
      >
        <UserCircleIcon />
        Sign in
      </Button>
    </SignInButton>
  </Show>
</template>
