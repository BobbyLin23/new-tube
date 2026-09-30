<script setup lang="ts">
defineProps<{
  categoryId?: string;
}>();

const route = useRoute();
const router = useRouter();

const orpc = useOrpc();

const { data: categories, isLoading } = useQuery(orpc.categories.list.queryOptions());

const data = computed(() =>
  (categories.value || []).map((category) => ({
    value: category.id,
    label: category.name,
  })),
);

const onSelect = (value: string | null) => {
  if (value) {
    router.replace({ query: { ...route.query, categoryId: value } });
  } else {
    const { categoryId: _, ...rest } = route.query;

    router.replace({ query: rest });
  }
};
</script>

<template>
  <template v-if="!isLoading">
    <FilterCarousel :data="data" @select="onSelect" :value="categoryId" />
  </template>
  <template v-else>
    <FilterCarousel isLoading :data="[]" @select="() => {}" />
  </template>
</template>
