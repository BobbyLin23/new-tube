<script setup lang="ts">
import { MoreVerticalIcon, ShareIcon, ListPlusIcon, Trash2Icon } from "@lucide/vue";
import type { ButtonVariants } from "@/components/ui/button";
import { toast } from "vue-sonner";

const props = defineProps<{
  videoId: string;
  variant?: ButtonVariants["variant"];
  // Vue passes @remove as onRemove, so this also supports event-style usage.
  onRemove?: () => void;
}>();

async function onShare() {
  const fullUrl = new URL(`/videos/${encodeURIComponent(props.videoId)}`, window.location.origin)
    .href;

  try {
    await navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
  } catch {
    toast.error("Unable to copy the link. Please try again.");
  }
}

const hasRemove = computed(() => Boolean(props.onRemove));
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        :variant="variant"
        size="icon"
        type="button"
        aria-label="Video actions"
        class="rounded-full"
        @click.stop
      >
        <MoreVerticalIcon />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" @click.stop>
      <DropdownMenuItem @select="onShare">
        <ShareIcon class="mr-2 size-4" />
        Share
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <ListPlusIcon class="mr-2 size-4" />
        Add to playlist
      </DropdownMenuItem>
      <DropdownMenuItem v-if="hasRemove" variant="destructive" @select="props.onRemove?.()">
        <Trash2Icon class="mr-2 size-4" />
        Remove
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
