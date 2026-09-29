<script setup lang="ts">
import { toast } from "vue-sonner";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
}

const props = defineProps<ThumbnailUploadModalProps>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const orpc = useOrpc();
const queryCache = useQueryCache();

const file = ref<File | null>(null);
const isUploading = ref(false);

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const selected = input.files?.[0] ?? null;
  if (selected && selected.size > MAX_SIZE_BYTES) {
    toast.error("Image must be smaller than 4MB");
    input.value = "";
    return;
  }
  file.value = selected;
}

async function onUpload() {
  if (!file.value) return;
  isUploading.value = true;
  try {
    const rawType = file.value.type;
    const contentType: "image/jpeg" | "image/png" | "image/webp" =
      rawType === "image/png" || rawType === "image/webp" ? rawType : "image/jpeg";
    const { key, uploadUrl } = await orpc.videos.uploadThumbnailUrl.call({
      id: props.videoId,
      contentType,
    });

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file.value,
      headers: { "Content-Type": contentType },
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    await orpc.videos.setThumbnail.call({ id: props.videoId, key });

    queryCache.invalidateQueries({ key: orpc.studio.list.key() });
    queryCache.invalidateQueries({ key: orpc.studio.getOne.key({ input: { id: props.videoId } }) });
    toast.success("Thumbnail uploaded");
    emit("update:open", false);
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    isUploading.value = false;
  }
}
</script>

<template>
  <ResponsiveModal
    title="Upload a thumbnail"
    :open="props.open"
    @update:open="emit('update:open', $event)"
  >
    <div class="flex flex-col gap-4 p-4">
      <Input type="file" :accept="ACCEPTED_TYPES" @change="onFileChange" />
      <Button :disabled="!file || isUploading" @click="onUpload">
        {{ isUploading ? "Uploading..." : "Upload" }}
      </Button>
    </div>
  </ResponsiveModal>
</template>
