<script setup lang="ts">
const orpc = useOrpc();

const { data: planets } = useQuery(orpc.planet.list.queryOptions({}));
</script>

<template>
  <div>
    Hello
    <ul v-if="planets">
      <li v-for="planet in planets" :key="planet.id">{{ planet.name }}</li>
    </ul>
    <Button>Click</Button>
    <ModeToggle />
  </div>
</template>
