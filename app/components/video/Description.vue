<script lang="ts" setup>
import { cn } from "~/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "@lucide/vue";

const isExpanded = ref(false);

defineProps<{
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
  description?: string | null;
}>();
</script>

<template>
  <div
    @click="() => (isExpanded = !isExpanded)"
    class="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
  >
    <div class="flex gap-2 text-sm mb-2">
      <span class="font-medium"> {{ isExpanded ? expandedViews : compactViews }} views </span>
      <span class="font-medium"> {{ isExpanded ? expandedDate : compactDate }} </span>
    </div>
    <div class="relative">
      <p :class="cn('text-sm whitespace-pre-wrap', !isExpanded && 'line-clamp-2')">
        {{ description || "No description" }}
      </p>
      <div class="flex items-center gap-1 mt-4 text-sm font-medium">
        <template v-if="!isExpanded"> Show less <ChevronUpIcon class="size-4" /> </template>
        <template v-else> Show more <ChevronDownIcon class="size-4" /> </template>
      </div>
    </div>
  </div>
</template>
