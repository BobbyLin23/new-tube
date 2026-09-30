import { toast } from "vue-sonner";

export function useVideoGeneration(options: {
  videoId: () => string;
  onCompleted: (field: VideoGenerationKind) => Promise<void>;
}) {
  const orpc = useOrpc();
  const pending = reactive({ title: false, description: false, thumbnail: false });
  const timers = new Map<VideoGenerationKind, ReturnType<typeof setTimeout>>();
  let disposed = false;

  onScopeDispose(() => {
    disposed = true;
    timers.forEach(clearTimeout);
    timers.clear();
  });

  async function generate(field: VideoGenerationKind, prompt?: string) {
    if (pending[field]) return false;
    pending[field] = true;
    const id = options.videoId();
    const startedAt = Date.now();
    try {
      const { workflowRunId } =
        field === "thumbnail"
          ? await orpc.videos.generateThumbnail.call({ id, prompt: prompt ?? "" })
          : await (
              field === "title" ? orpc.videos.generateTitle : orpc.videos.generateDescription
            ).call({ id });
      if (disposed) return;
      toast.success("Background job started", {
        description: `Your generated ${field === "thumbnail" ? "thumbnail" : "text"} will appear when it is ready.`,
      });

      async function poll() {
        if (disposed || options.videoId() !== id) return;
        try {
          const { status } = await orpc.videos.generationStatus.call({ id, workflowRunId });
          if (disposed || options.videoId() !== id) return;
          if (status === "completed") {
            await options.onCompleted(field);
            pending[field] = false;
            toast.success(
              `${field === "title" ? "Title" : field === "description" ? "Description" : "Thumbnail"} generated`,
            );
            return;
          }
          if (status === "failed" || status === "skipped") {
            pending[field] = false;
            toast.error(
              status === "skipped"
                ? "Video changed during generation. Your saved edits were kept."
                : "Generation failed. Please try again.",
            );
            return;
          }
        } catch {
          // Temporary status lookup failures should not abandon a running job.
        }
        if (Date.now() - startedAt > 5 * 60_000) {
          pending[field] = false;
          toast.info("The job is still taking time", {
            description: "Check its status in Upstash Workflow and reload the video later.",
          });
          return;
        }
        timers.set(field, setTimeout(poll, 3_000));
      }
      timers.set(field, setTimeout(poll, 3_000));
      return true;
    } catch (error) {
      pending[field] = false;
      toast.error(error instanceof Error ? error.message : "Unable to start generation");
      return false;
    }
  }

  return { pending: readonly(pending), generate };
}
