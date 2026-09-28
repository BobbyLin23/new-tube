<script setup lang="ts">
defineProps<{
  categoryId?: string;
}>();

const router = useRouter();

const orpc = useOrpc();

const { data: categories } = useQuery(orpc.categories.list.queryOptions());

const data = computed(() =>
  (categories.value || []).map((category) => ({
    value: category.id,
    label: category.name,
  })),
);

const onSelect = (value: string | null) => {
  const url = new URL(window.location.href);

  if (value) {
    url.searchParams.set("categoryId", value);
  } else {
    url.searchParams.delete("categoryId");
  }

  router.push(url.toString());
};
</script>

<template>
  <Suspense>
    <FilterCarousel :data="data" @select="onSelect" :value="categoryId" />
    <template #fallback>
      <FilterCarousel isLoading :data="[]" @select="() => {}" />
    </template>
  </Suspense>
</template>
