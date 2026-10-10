import { ORPCError } from "@orpc/client";
import type { MaybeRefOrGetter } from "vue";
import { toast } from "vue-sonner";

interface UseSubscriptionProps {
  userId: MaybeRefOrGetter<string>;
  isSubscribed: MaybeRefOrGetter<boolean>;
  fromVideoId?: MaybeRefOrGetter<string | undefined>;
}

export function useSubscription(options: UseSubscriptionProps) {
  const clerk = useClerk();
  const orpc = useOrpc();
  const queryCache = useQueryCache();

  function onSuccess(message: string) {
    toast.success(message);
    // TODO: Invalidate subscription lists and user details when those queries exist.
    const videoId = toValue(options.fromVideoId);

    if (videoId) {
      return queryCache.invalidateQueries({
        key: orpc.videos.getOne.queryKey({ input: { id: videoId } }),
      });
    }
  }

  function onError(error: unknown) {
    toast.error("Something went wrong");

    if (error instanceof ORPCError && error.code === "UNAUTHORIZED") {
      clerk.value?.openSignIn();
    }
  }

  const { mutate: subscribe, isLoading: isSubscribing } = useMutation(
    orpc.subscriptions.create.mutationOptions({
      onSuccess: () => onSuccess("Subscribed"),
      onError,
    }),
  );

  const { mutate: unsubscribe, isLoading: isUnsubscribing } = useMutation(
    orpc.subscriptions.remove.mutationOptions({
      onSuccess: () => onSuccess("Unsubscribed"),
      onError,
    }),
  );

  const isPending = computed(() => isSubscribing.value || isUnsubscribing.value);

  function onClick() {
    if (isPending.value) return;

    const input = { userId: toValue(options.userId) };

    if (toValue(options.isSubscribed)) {
      unsubscribe(input);
    } else {
      subscribe(input);
    }
  }

  return { isPending, onClick };
}
