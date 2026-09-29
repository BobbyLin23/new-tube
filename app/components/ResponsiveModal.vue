<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

defineProps<{
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isMobile = useMediaQuery("(max-width: 768px)");
</script>

<template>
  <Drawer
    v-if="isMobile"
    data-slot="responsive-modal"
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{{ title }}</DrawerTitle>
      </DrawerHeader>
      <slot />
    </DrawerContent>
  </Drawer>

  <Sheet v-else :open="open" @update:open="emit('update:open', $event)">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{{ title }}</SheetTitle>
      </SheetHeader>
      <slot />
    </SheetContent>
  </Sheet>
</template>
