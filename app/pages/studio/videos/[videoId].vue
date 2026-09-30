<script setup lang="ts">
import { useForm } from "@tanstack/vue-form";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon,
} from "@lucide/vue";
import { toast } from "vue-sonner";
import { snakeCaseToTitle } from "~/lib/utils";
import { THUMBNAIL_FALLBACK } from "~/lib/constants";
import { z } from "zod";

definePageMeta({
  layout: "studio",
  middleware: "auth",
});

const route = useRoute();

const videoId = computed(() => route.params.videoId as string);

const orpc = useOrpc();
const queryCache = useQueryCache();

const { data: categories } = useQuery(orpc.categories.list.queryOptions());

const currentCategories = computed(() =>
  (categories.value || []).map((category) => ({
    value: category.id,
    label: category.name,
  })),
);

const {
  data: video,
  isPending: videoPending,
  isLoading: videoLoading,
  error: videoError,
  refresh: refreshVideo,
  refetch: refetchVideo,
} = useQuery(orpc.studio.getOne.queryOptions({ input: { id: videoId.value } }));

// The form captures defaultValues once, so `video` must be resolved before
// useForm() runs. On the server the query normally resolves via
// onServerPrefetch, i.e. AFTER setup, leaving field state stale in the SSR
// render and causing hydration mismatches on the hidden native <select>s.
if (import.meta.server) {
  await refreshVideo();
}

const isThumbnailModalOpen = ref(false);

const { mutate: restoreThumbnail, isLoading: isRestoringThumbnail } = useMutation(
  orpc.videos.restoreThumbnail.mutationOptions({
    onSuccess: () => {
      queryCache.invalidateQueries({ key: orpc.studio.list.key() });
      queryCache.invalidateQueries({
        key: orpc.studio.getOne.key({ input: { id: videoId.value } }),
      });
      toast.success("Thumbnail restored");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  }),
);

const { mutate: update, isLoading: isUpdating } = useMutation(
  orpc.videos.update.mutationOptions({
    onSuccess: () => {
      queryCache.invalidateQueries({ key: orpc.studio.list.key() });
      toast.success("Video updated");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  }),
);

const { mutate: remove, isLoading: isRemoving } = useMutation(
  orpc.videos.remove.mutationOptions({
    onSuccess: () => {
      queryCache.invalidateQueries({ key: orpc.studio.list.key() });
      toast.success("Video removed");
      navigateTo("/studio");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  }),
);

const videoUpdateFormSchema = videoUpdateSchema
  .pick({ title: true, description: true, categoryId: true, visibility: true })
  .extend({ title: z.string().min(1, "Title is required") });

const form = useForm({
  defaultValues: {
    title: video.value?.title ?? "",
    description: video.value?.description ?? undefined,
    visibility: video.value?.visibility,
    categoryId: video.value?.categoryId ?? undefined,
  } as z.input<typeof videoUpdateFormSchema>,
  validators: {
    onSubmit: videoUpdateFormSchema,
  },
  onSubmit: ({ value }) => {
    update({ id: videoId.value, ...value });
  },
});

// Refresh each untouched field independently so background updates cannot erase edits.
watch(video, (v) => {
  if (!v) return;
  if (!generationPending.title && !form.getFieldMeta("title")?.isDirty)
    form.setFieldValue("title", v.title, { dontUpdateMeta: true });
  if (!generationPending.description && !form.getFieldMeta("description")?.isDirty)
    form.setFieldValue("description", v.description ?? "", { dontUpdateMeta: true });
  if (!form.getFieldMeta("visibility")?.isDirty)
    form.setFieldValue("visibility", v.visibility, { dontUpdateMeta: true });
  if (!form.getFieldMeta("categoryId")?.isDirty)
    form.setFieldValue("categoryId", v.categoryId ?? undefined, { dontUpdateMeta: true });
});

const transcriptReady = computed(() =>
  Boolean(
    video.value?.muxPlaybackId &&
    video.value?.muxTrackId &&
    video.value?.muxTrackStatus === "ready",
  ),
);
const valuesAtGeneration = { title: "", description: "" };
const { pending: generationPending, generate } = useVideoGeneration({
  videoId: () => videoId.value,
  onCompleted: async (field) => {
    await refetchVideo(true);
    queryCache.invalidateQueries({ key: orpc.studio.list.key() });
    if (video.value && (form.state.values[field] ?? "") === valuesAtGeneration[field]) {
      form.setFieldValue(field, video.value[field] ?? "");
    } else {
      toast.info("Your draft edits were kept", {
        description: "The generated text was saved to the video. Reload to view it.",
      });
    }
  },
});

function onGenerate(field: VideoGenerationField) {
  valuesAtGeneration[field] = form.state.values[field] ?? "";
  void generate(field);
}

// TODO: Change if deploying outside of localhost
const config = useRuntimeConfig();
const fullUrl = computed(
  () => `${config.public.siteUrl || "http://localhost:5011"}/videos/${videoId.value}`,
);

const isCopied = ref(false);

async function onCopy() {
  await navigator.clipboard.writeText(fullUrl.value);
  isCopied.value = true;

  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
}

function isInvalid(field: { state: { meta: { isTouched: boolean; isValid: boolean } } }) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}
</script>

<template>
  <StudioThumbnailUploadModal v-model:open="isThumbnailModalOpen" :video-id="videoId" />
  <div class="px-4 pt-2.5 max-w-5xl">
    <p v-if="videoPending" role="status" class="text-sm text-muted-foreground">
      Loading video details...
    </p>
    <div v-else-if="videoError && !video" role="alert" class="space-y-3">
      <p class="text-sm text-destructive">Unable to load video details.</p>
      <Button type="button" variant="outline" :disabled="videoLoading" @click="refreshVideo()">
        {{ videoLoading ? "Retrying..." : "Try again" }}
      </Button>
    </div>
    <form v-else-if="video" @submit.prevent="form.handleSubmit">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Video details</h1>
          <p class="text-xs text-muted-foreground">Manage your video details</p>
        </div>
        <div class="flex items-center gap-x-2">
          <Button
            type="submit"
            :disabled="isUpdating || generationPending.title || generationPending.description"
          >
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="remove({ id: videoId })">
                <TrashIcon class="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="space-y-8 lg:col-span-3">
          <FieldGroup>
            <form.Field name="title">
              <template #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <div class="flex items-center gap-x-2">
                    <FieldLabel :for="field.name">Title</FieldLabel>
                    <StudioGenerateButton
                      field="title"
                      :loading="generationPending.title"
                      :disabled="isUpdating || isRemoving"
                      :transcript-ready="transcriptReady"
                      @generate="onGenerate('title')"
                    />
                  </div>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    :aria-invalid="isInvalid(field)"
                    placeholder="Add a title to your video"
                    @blur="field.handleBlur"
                    @input="field.handleChange($event.target.value)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </template>
            </form.Field>
            <form.Field name="description">
              <template #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <div class="flex items-center gap-x-2">
                    <FieldLabel :for="field.name">Description</FieldLabel>
                    <StudioGenerateButton
                      field="description"
                      :loading="generationPending.description"
                      :disabled="isUpdating || isRemoving"
                      :transcript-ready="transcriptReady"
                      @generate="onGenerate('description')"
                    />
                  </div>
                  <Textarea
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value ?? ''"
                    :aria-invalid="isInvalid(field)"
                    rows="10"
                    class="resize-none pr-10"
                    placeholder="Add a description to your video"
                    @blur="field.handleBlur"
                    @input="field.handleChange($event.target.value)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </template>
            </form.Field>
            <div class="relative h-21 w-38.25 border border-dashed border-neutral-400 p-0.5 group">
              <img
                :src="video?.thumbnailUrl || THUMBNAIL_FALLBACK"
                alt="Thumbnail"
                class="h-full w-full object-cover"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    class="bg-black/50 hover:bg-black/70 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                  >
                    <MoreVerticalIcon class="text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right">
                  <DropdownMenuItem @click="isThumbnailModalOpen = true">
                    <ImagePlusIcon class="size-4 mr-1" />
                    Change
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled title="AI thumbnail generation is not available yet">
                    <SparklesIcon class="size-4 mr-1" />
                    AI-generated
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    :disabled="isRestoringThumbnail"
                    @click="restoreThumbnail({ id: videoId })"
                  >
                    <RotateCcwIcon class="size-4 mr-1" />
                    Restore
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <form.Field name="categoryId">
              <template #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name"> Category </FieldLabel>
                  <Select
                    :name="field.name"
                    :model-value="field.state.value ?? undefined"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  >
                    <SelectTrigger :aria-invalid="isInvalid(field)">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="category in currentCategories"
                        :key="category.value"
                        :value="category.value"
                      >
                        {{ category.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </template>
            </form.Field>
          </FieldGroup>
        </div>
        <div class="flex flex-col gap-y-8 lg:col-span-2">
          <div class="flex flex-col gap-4 bg-sidebar rounded-xl overflow-hidden h-fit">
            <div class="aspect-video overflow-hidden relative">
              <VideoPlayer
                :playback-id="video?.muxPlaybackId"
                :thumbnail-url="video?.thumbnailUrl"
              />
            </div>
            <div class="p-4 flex flex-col gap-y-6">
              <div class="flex items-center gap-x-2 min-w-0">
                <div class="flex flex-col gap-y-1 min-w-0">
                  <p class="text-muted-foreground text-xs">Video link</p>
                  <div class="flex items-center gap-x-2 min-w-0">
                    <NuxtLink
                      :href="`/videos/${video?.id}`"
                      class="min-w-0 flex-1 truncate text-sm text-blue-500"
                    >
                      {{ fullUrl }}
                    </NuxtLink>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="shrink-0"
                      :disabled="isCopied"
                      @click="onCopy"
                    >
                      <CopyCheckIcon v-if="isCopied" />
                      <CopyIcon v-else />
                    </Button>
                  </div>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div class="flex flex-col gap-y-1">
                  <p class="text-muted-foreground text-xs">Video status</p>
                  <p class="text-sm">
                    {{ snakeCaseToTitle(video?.muxStatus || "preparing") }}
                  </p>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div class="flex flex-col gap-y-1">
                  <p class="text-muted-foreground text-xs">Subtitles status</p>
                  <p class="text-sm">
                    {{ snakeCaseToTitle(video?.muxTrackStatus || "no_subtitles") }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form.Field name="visibility">
            <template #default="{ field }">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name"> Visibility </FieldLabel>
                <Select
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  @update:model-value="(v) => field.handleChange(v as 'public' | 'private')"
                >
                  <SelectTrigger :aria-invalid="isInvalid(field)">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div class="flex items-center">
                        <Globe2Icon class="size-4 mr-2" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div class="flex items-center">
                        <LockIcon class="size-4 mr-2" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </template>
          </form.Field>
        </div>
      </div>
    </form>
  </div>
</template>
