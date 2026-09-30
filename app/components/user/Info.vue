<script lang="ts" setup>
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const userInfoVariants = cva("flex items-center gap-1", {
  variants: {
    size: {
      default: "[&_p]:text-sm [&_svg]:size-4",
      lg: "[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium [&_p]:text-primary",
      sm: "[&_p]:text-xs [&_svg]:size-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserInfoProps {
  name: string;
  size?: VariantProps<typeof userInfoVariants>["size"];
  class?: string;
}

const props = defineProps<UserInfoProps>();
</script>

<template>
  <div :class="cn(userInfoVariants({ size, class: props.class }))">
    <Tooltip>
      <TooltipTrigger asChild>
        <p class="line-clamp-1">{{ name }}</p>
      </TooltipTrigger>
      <TooltipContent align="center">
        <p>{{ name }}</p>
      </TooltipContent>
    </Tooltip>
  </div>
</template>
