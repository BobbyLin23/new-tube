<script lang="ts" setup>
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const userInfoVariants = cva("flex items-center gap-1", {
  variants: {
    size: {
      default: "[&_p]:text-sm [&_svg]:size-4",
      lg: "[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium [&_p]:text-black",
      sm: "[&_p]:text-xs [&_svg]:size-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
  name: string;
  className?: string;
}

defineProps<UserInfoProps>();
</script>

<template>
  <div :class="cn(userInfoVariants({ size, className }))">
    <Tooltip>
      <TooltipTrigger asChild>
        <p class="text-gray-500 hover:text-gray-800 line-clamp-1">{{ name }}</p>
      </TooltipTrigger>
      <TooltipContent align="center" class="bg-black/70">
        <p>{{ name }}</p>
      </TooltipContent>
    </Tooltip>
  </div>
</template>
