<script setup lang="ts">
import { Loader2Icon, SparklesIcon } from "@lucide/vue";

const props = defineProps<{
  field: VideoGenerationField;
  loading: boolean;
  disabled: boolean;
  transcriptReady: boolean;
}>();
defineEmits<{ generate: [] }>();

const label = computed(() =>
  props.loading ? `Generating ${props.field}...` : `Generate ${props.field} with AI`,
);
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <span class="inline-flex" tabindex="0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="size-6 rounded-full [&_svg]:size-3"
          :disabled="disabled || loading || !transcriptReady"
          :aria-label="label"
          :aria-busy="loading"
          @click="$emit('generate')"
        >
          <Loader2Icon v-if="loading" class="animate-spin" />
          <SparklesIcon v-else />
        </Button>
      </span>
    </TooltipTrigger>
    <TooltipContent>
      {{ transcriptReady ? label : "Available when video subtitles are ready" }}
    </TooltipContent>
  </Tooltip>
</template>
