<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { CarouselApi } from "~/components/ui/carousel";

defineProps<{
  isLoading?: boolean;
  data: Array<{
    value: string;
    label: string;
  }>;
  value?: string | null;
}>();

defineEmits<{
  select: [value: string | null];
}>();

const api = ref<CarouselApi>();
const current = ref(0);
const count = ref(0);

function setApi(value: CarouselApi) {
  api.value = value;
}

watchOnce(api, (api) => {
  if (!api) return;

  count.value = api.scrollSnapList().length;
  current.value = api.selectedScrollSnap() + 1;

  api.on("select", () => {
    current.value = api.selectedScrollSnap() + 1;
  });
});
</script>

<template>
  <div class="relative w-full">
    <div
      :class="
        cn(
          'absolute left-12 top-0 bottom-0 w-12 z-10 bg-linear-to-r from-background to-transparent pointer-events-none',
          current === 1 && 'hidden',
        )
      "
    />

    <Carousel
      class="w-full px-12"
      @init-api="setApi"
      :opts="{
        align: 'start',
        dragFree: true,
      }"
    >
      <CarouselContent class="-ml-3">
        <CarouselItem
          v-if="!isLoading"
          @click="() => $emit('select', null)"
          class="pl-3 basis-auto"
        >
          <Badge
            :variant="!value ? 'default' : 'secondary'"
            class="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
          >
            All
          </Badge>
        </CarouselItem>
        <template v-else>
          <CarouselItem v-for="index in 14" :key="index" class="pl-3 basis-auto">
            <Skeleton class="rounded-lg px-3 py-1 h-full text-sm w-25 font-semibold">
              &nbsp;
            </Skeleton>
          </CarouselItem>
        </template>
        <CarouselItem
          v-for="item in data"
          :key="item.value"
          class="pl-3 basis-auto"
          @click="() => $emit('select', item.value)"
        >
          <Badge
            :variant="value === item.value ? 'default' : 'secondary'"
            class="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
          >
            {{ item.label }}
          </Badge>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious class="left-0 z-20" />
      <CarouselNext class="right-0 z-20" />
    </Carousel>

    <div
      :class="
        cn(
          'absolute right-12 top-0 bottom-0 w-12 z-10 bg-linear-to-l from-background to-transparent pointer-events-none',
          current === count && 'hidden',
        )
      "
    />
  </div>
</template>
