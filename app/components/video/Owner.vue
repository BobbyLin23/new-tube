<script lang="ts" setup>
defineProps<{
  videoId: string;
  user: VideoGetOneOutput["user"];
}>();

const { userId: clerkUserId } = useAuth();
</script>

<template>
  <div class="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
    <NuxtLink :href="`/user/${user.id}`">
      <div class="flex items-center gap-3 min-w-0">
        <UserAvatar size="lg" :imageUrl="user.imageUrl" :name="user.name" />
        <div class="flex flex-col gap-1 min-w-0">
          <UserInfo size="lg" :name="user.name" />
          <span class="text-sm text-muted-foreground line-clamp-1"> {{ 0 }} subscribers </span>
        </div>
      </div>
    </NuxtLink>
    <Button v-if="user.clerkId === clerkUserId" variant="secondary" class="rounded-full" asChild>
      <NuxtLink :href="`/studio/videos/${videoId}`"> Edit video </NuxtLink>
    </Button>
    <SubscriptionButton
      v-else
      @click="() => {}"
      :disabled="false"
      :isSubscribed="false"
      class="flex-none"
    />
  </div>
</template>
