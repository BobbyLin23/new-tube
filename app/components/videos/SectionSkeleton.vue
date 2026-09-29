<script setup lang="ts"></script>

<template>
  <div class="border-y">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="pl-6 w-127.5">Video</TableHead>
          <TableHead>Visibility</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead class="text-right">Views</TableHead>
          <TableHead class="text-right">Comments</TableHead>
          <TableHead class="text-right pr-6">Likes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="index in 5" :key="index">
          <TableCell class="pl-6">
            <div class="flex items-center gap-4">
              <Skeleton class="h-20 w-36" />
              <div class="flex flex-col gap-2">
                <Skeleton class="h-4 w-25" />
                <Skeleton class="h-3 w-37.5" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-24" />
          </TableCell>
          <TableCell class="text-right">
            <Skeleton class="h-4 w-12 ml-auto" />
          </TableCell>
          <TableCell class="text-right">
            <Skeleton class="h-4 w-12 ml-auto" />
          </TableCell>
          <TableCell class="text-right pr-6">
            <Skeleton class="h-4 w-12 ml-auto" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
