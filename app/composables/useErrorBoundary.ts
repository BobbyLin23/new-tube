import type { InjectionKey } from "vue";

interface ErrorBoundaryApi {
  showBoundary: (error: unknown) => void;
}

const errorBoundaryKey = Symbol("errorBoundary") as InjectionKey<ErrorBoundaryApi>;

export function provideErrorBoundary(api: ErrorBoundaryApi) {
  provide(errorBoundaryKey, api);
}

export function useErrorBoundary(): ErrorBoundaryApi {
  const api = inject(errorBoundaryKey, null);
  if (!api) {
    throw new Error("useErrorBoundary() must be called within <ErrorBoundary>");
  }
  return api;
}
