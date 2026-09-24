<script setup lang="ts">
import { RiSunFill, RiMoonFill } from "@remixicon/vue";

const colorMode = useColorMode();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon">
        <RiMoonFill
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <RiSunFill
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="colorMode.preference = 'light'"> Light </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'dark'"> Dark </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'system'"> System </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
