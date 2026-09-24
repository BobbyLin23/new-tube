<script setup lang="ts">
import { UserCircleIcon } from "@lucide/vue";
</script>

<template>
  <SignedIn>
    <UserButton />
  </SignedIn>
  <SignedOut>
    <SignInButton mode="modal">
      <Button
        variant="outline"
        class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
      >
        <UserCircleIcon />
        Sign in
      </Button>
    </SignInButton>
  </SignedOut>
</template>
