<script lang="ts" setup>
const props = defineProps<{
  videoId: string;
  user: VideoGetOneOutput["user"];
}>();

const { userId: clerkUserId, isLoaded } = useAuth();

const { isPending, onClick } = useSubscription({
  userId: () => props.user.id,
  isSubscribed: () => props.user.viewerSubscribed,
  fromVideoId: () => props.videoId,
});
</script>

<template>
  <div class="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
    <NuxtLink :href="`/user/${user.id}`">
      <div class="flex items-center gap-3 min-w-0">
        <UserAvatar size="lg" :imageUrl="user.imageUrl" :name="user.name" />
        <div class="flex flex-col gap-1 min-w-0">
          <UserInfo size="lg" :name="user.name" />
          <span class="text-sm text-muted-foreground line-clamp-1">
            {{ user.subscriberCount }} subscribers
          </span>
        </div>
      </div>
    </NuxtLink>
    <Button v-if="user.clerkId === clerkUserId" variant="secondary" class="rounded-full" asChild>
      <NuxtLink :href="`/studio/videos/${videoId}`"> Edit video </NuxtLink>
    </Button>
    <SubscriptionButton
      v-else
      @click="onClick"
      :disabled="isPending || !isLoaded"
      :isSubscribed="user.viewerSubscribed"
      class="flex-none"
    />
  </div>
</template>
