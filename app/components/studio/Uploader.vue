<script setup lang="ts">
import { UploadIcon } from "@lucide/vue";

const props = defineProps<{
  endpoint?: string | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const UPLOADER_ID = "video-uploader";

// Custom elements from @mux/mux-uploader self-register on import.
// Client-only import: `globalThis.customElements` is undefined during SSR.
onMounted(() => {
  import("@mux/mux-uploader");
});

const endpoint = computed(() => props.endpoint ?? undefined);
</script>

<template>
  <div>
    <!-- Uploader element: state management only, visually hidden -->
    <mux-uploader
      :id="UPLOADER_ID"
      class="hidden group/uploader"
      :endpoint="endpoint"
      @success="emit('success')"
    />
    <mux-uploader-drop :mux-uploader="UPLOADER_ID" class="group/drop">
      <div slot="heading" class="flex flex-col items-center gap-6">
        <div class="bg-muted flex h-32 w-32 items-center justify-center gap-2 rounded-full">
          <UploadIcon
            class="mux-drop-icon size-10 text-muted-foreground transition-all duration-300"
          />
        </div>
        <div class="flex flex-col gap-2 text-center">
          <p class="text-sm">Drag and drop video files to upload</p>
          <p class="text-muted-foreground text-xs">
            Your videos will be private until you publish them
          </p>
        </div>
        <mux-uploader-file-select :mux-uploader="UPLOADER_ID">
          <Button type="button" class="rounded-full"> Select files </Button>
        </mux-uploader-file-select>
      </div>
      <span slot="separator" class="hidden" />
      <mux-uploader-status :mux-uploader="UPLOADER_ID" class="text-sm" />
      <mux-uploader-progress :mux-uploader="UPLOADER_ID" class="text-sm" type="percentage" />
      <mux-uploader-progress :mux-uploader="UPLOADER_ID" type="bar" />
    </mux-uploader-drop>
  </div>
</template>

<style scoped>
/* `active` attribute is set by <mux-uploader-drop> while a file is dragged over it */
mux-uploader-drop[active] .mux-drop-icon {
  animation: bounce 1s infinite;
}

/* Theme the shadow-DOM progress bar with design tokens */
mux-uploader-progress {
  --progress-bar-fill-color: var(--primary);
  --progress-bar-background-color: var(--muted);
  --progress-bar-border-radius: 9999px;
  --progress-bar-box-shadow: none;
}
</style>
