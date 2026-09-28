<script setup lang="ts">
import { cn } from "~/lib/utils";
import { cva } from "class-variance-authority";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps {
  imageUrl: string;
  name: string;
  size?: "default" | "xs" | "sm" | "lg" | "xl";
  class?: string;
  onClick?: () => void;
}

const props = defineProps<UserAvatarProps>();
</script>

<template>
  <Avatar :class="cn(avatarVariants({ size, className: props.class }))" @click="onClick">
    <AvatarImage :src="imageUrl" :alt="name" />
  </Avatar>
</template>
