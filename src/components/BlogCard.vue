<script setup lang="ts">
import type { Blog } from "@/types/blog";
import IconCalendar from "~icons/lucide/calendar";
import IconEye from "~icons/lucide/eye";
import { formatDate } from "@/utils/dateUtil";
import { RouterLink } from "vue-router";

defineProps<{ blog: Blog }>();
</script>

<template>
  <RouterLink
    :to="`/blogs/${blog.id}`"
    class="flex gap-4 p-4 transition-all duration-300 md:flex-col rounded-2xl border border-border/20 bg-surface/30 hover:border-primary/40 hover:bg-surface-raised hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 group"
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
      <div class="flex items-center gap-3 mb-2 text-xs font-medium md:text-sm text-content/60">
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
  </RouterLink>
</template>
