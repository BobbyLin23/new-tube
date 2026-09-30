<script lang="ts" setup>
import { cn } from "~/lib/utils";
import { type ButtonVariants, Button } from "~/components/ui/button";
import type { HTMLAttributes } from "vue";

interface SubscriptionButtonProps {
  disabled: boolean;
  isSubscribed: boolean;
  class?: HTMLAttributes["class"];
  size?: ButtonVariants["size"];
}

const props = defineProps<SubscriptionButtonProps>();
defineEmits<{
  click: [];
}>();
</script>

<template>
  <Button
    :size="size"
    :variant="isSubscribed ? 'secondary' : 'default'"
    :class="cn('rounded-full', props.class)"
    @click="() => $emit('click')"
    :disabled="disabled"
  >
    {{ isSubscribed ? "Unsubscribe" : "Subscribe" }}
  </Button>
</template>
