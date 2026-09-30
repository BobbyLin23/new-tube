<script setup lang="ts">
const props = defineProps<{
  resetKeys?: unknown[];
  onError?: (error: unknown, info: string) => void;
  onReset?: () => void;
}>();

const emit = defineEmits<{
  error: [error: unknown];
}>();

const error = shallowRef<unknown>(null);

function reset() {
  if (error.value === null) return;
  error.value = null;
  props.onReset?.();
}

provideErrorBoundary({
  showBoundary: (err) => (error.value = err),
});

const nuxtApp = useNuxtApp();

onErrorCaptured((err, instance, info) => {
  error.value = err;
  nuxtApp.callHook("vue:error", err, instance, info)?.catch((hookError) => {
    console.error("[ErrorBoundary] Error in `vue:error` hook", hookError);
  });
  props.onError?.(err, info);
  emit("error", err);
  return false;
});

watch(
  () => props.resetKeys,
  (next, prev) => {
    const nextKeys = next ?? [];
    const prevKeys = prev ?? [];
    if (
      nextKeys.length !== prevKeys.length ||
      nextKeys.some((key, index) => !Object.is(key, prevKeys[index]))
    ) {
      reset();
    }
  },
);
</script>

<template>
  <slot v-if="error !== null" name="error" :error="error" :reset="reset" />
  <slot v-else />
</template>
