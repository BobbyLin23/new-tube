<script setup lang="ts">
import { useForm } from "@tanstack/vue-form";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  LockIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "@lucide/vue";
import { toast } from "vue-sonner";
import { snakeCaseToTitle } from "~/lib/utils";
import { z } from "zod";
import { videoUpdateSchema } from "~~/server/db/schema";

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

const { data: video, isLoading: videoLoading } = useQuery(
  orpc.studio.getOne.queryOptions({
    input: { id: videoId.value },
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

watch(video, (v) => {
  if (v && !form.state.isDirty) {
    form.setFieldValue("title", v.title);
    form.setFieldValue("description", v.description ?? "");
    form.setFieldValue("visibility", v.visibility);
    form.setFieldValue("categoryId", v.categoryId ?? undefined);
  }
});

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

function isInvalid(field: any) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}
</script>

<template>
  <div class="px-4 pt-2.5 max-w-5xl">
    <Suspense>
      <form @submit.prevent="form.handleSubmit">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">Video details</h1>
            <p class="text-xs text-muted-foreground">Manage your video details</p>
          </div>
          <div class="flex items-center gap-x-2">
            <Button type="submit" :disabled="isUpdating"> Save </Button>
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
                    <FieldLabel :for="field.name"> Title </FieldLabel>
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
                    <FieldLabel :for="field.name"> Description </FieldLabel>
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
            <div class="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
              <div class="aspect-video overflow-hidden relative">
                <VideoPlayer
                  :playback-id="video?.muxPlaybackId"
                  :thumbnail-url="video?.thumbnailUrl"
                />
              </div>
              <div class="p-4 flex flex-col gap-y-6">
                <div class="flex justify-between items-center gap-x-2">
                  <div class="flex flex-col gap-y-1">
                    <p class="text-muted-foreground text-xs">Video link</p>
                    <div class="flex items-center gap-x-2">
                      <NuxtLink :href="`/videos/${video?.id}`">
                        <p class="line-clamp-1 text-sm text-blue-500">{{ fullUrl }}</p>
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
      <template #fallback>
        <p>Loading...</p>
      </template>
    </Suspense>
  </div>
</template>
