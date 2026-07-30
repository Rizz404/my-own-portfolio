<script setup lang="ts">
import type Blog from "@/types/blog";
import { formatDate } from "@/utils/dateUtil";

defineProps<{ blog: Blog }>();
</script>

<template>
  <div
    class="flex gap-4 p-4 transition-all border border-transparent cursor-pointer group md:flex-col rounded-xl hover:border-border/30 hover:bg-surface-raised hover:-translate-y-1"
  >
    <img
      :src="
        blog.featuredImage ||
        'https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg'
      "
      :alt="blog.title"
      class="object-cover rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video"
    />
    <div class="flex flex-col">
      <div class="flex items-center gap-3 mb-2 text-xs font-medium md:text-sm text-content/50">
        <span class="flex items-center gap-1"
          ><IconCalendar class="size-3" /> {{ formatDate(blog.createdAt) }}</span
        >
        <span class="flex items-center gap-1"
          ><IconEye class="size-3" /> {{ blog.viewsCount }}</span
        >
      </div>
      <h3
        class="mb-2 text-lg font-semibold transition-colors text-content group-hover:text-primary"
      >
        {{ blog.title }}
      </h3>
      <p class="text-base font-normal leading-relaxed md:text-sm text-content/70 line-clamp-3">
        {{ blog.content }}
      </p>
    </div>
  </div>
</template>
