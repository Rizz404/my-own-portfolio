<script setup lang="ts">
import type Project from "@/types/project";
import { RouterLink } from "vue-router";

defineProps<{ project: Project }>();
</script>

<template>
  <RouterLink
    :to="`/projects/${project.id}`"
    class="flex gap-4 p-4 transition-all border border-transparent cursor-pointer group md:flex-col rounded-xl hover:border-border/30 hover:bg-surface-raised hover:-translate-y-1"
  >
    <div
      class="relative overflow-hidden rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video"
    >
      <img
        :src="
          project.logoUrl ||
          'https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg'
        "
        :alt="project.name"
        class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
      />
      <span
        class="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-md bg-background/80 backdrop-blur-sm border border-border/50"
      >
        {{ project.status || "Completed" }}
      </span>
    </div>
    <div class="flex flex-col mt-1">
      <h3
        class="mb-2 text-lg font-semibold transition-colors text-content group-hover:text-primary"
      >
        {{ project.name }}
      </h3>
      <p class="text-base font-normal leading-relaxed md:text-sm text-content/70 line-clamp-3">
        {{ project.description }}
      </p>
    </div>
  </RouterLink>
</template>
