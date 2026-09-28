<script setup lang="ts">
import { DEFAULT_LIMIT } from "~/lib/constants";

const orpc = useOrpc();

type StudioCursor = { id: string; updatedAt: Date };

const { data } = useInfiniteQuery(() =>
  orpc.studio.list.infiniteOptions<StudioCursor | undefined>({
    input: (cursor) => ({ limit: DEFAULT_LIMIT, cursor }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }),
);
</script>

<template>
  <div>
    {{ JSON.stringify(data, null, 2) }}
  </div>
</template>
