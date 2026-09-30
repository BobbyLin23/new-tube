<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
  submit: (prompt: string) => Promise<boolean | undefined>;
}>();
const open = defineModel<boolean>("open", { required: true });
const prompt = ref("");
const error = ref("");
const promptId = useId();

async function onSubmit() {
  if (props.loading) return;
  const result = thumbnailPromptSchema.safeParse(prompt.value);
  if (!result.success) {
    error.value = result.error.issues[0]?.message ?? "Enter a valid prompt";
    return;
  }
  error.value = "";
  if (await props.submit(result.data)) {
    prompt.value = "";
    open.value = false;
  }
}
</script>

<template>
  <ResponsiveModal v-model:open="open" title="Generate a thumbnail">
    <form class="flex flex-col gap-4 p-4" @submit.prevent="onSubmit">
      <Field :data-invalid="Boolean(error)">
        <FieldLabel :for="promptId">Prompt</FieldLabel>
        <Textarea
          :id="promptId"
          v-model="prompt"
          rows="5"
          maxlength="1500"
          class="resize-none"
          placeholder="Describe your thumbnail's subject, background, colors, and style"
          :disabled="loading"
          :aria-invalid="Boolean(error)"
          :aria-describedby="`${promptId}-help`"
          @update:model-value="error = ''"
        />
        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
      </Field>
      <div class="flex justify-end">
        <Button type="submit" :disabled="loading" :aria-busy="loading">
          {{ loading ? "Starting..." : "Generate" }}
        </Button>
      </div>
    </form>
  </ResponsiveModal>
</template>
