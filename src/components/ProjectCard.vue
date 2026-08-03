<script setup lang="ts">
import type Project from "@/types/project";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import IconChevronLeft from "~icons/lucide/chevron-left";
import IconChevronRight from "~icons/lucide/chevron-right";

const props = defineProps<{ project: Project }>();

// * Carousel
const currentIndex = ref(0);
const direction = ref<"next" | "prev">("next");

const images = computed(() => {
  return props.project.imageUrls && props.project.imageUrls.length > 0
    ? props.project.imageUrls
    : ["https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg"];
});

const nextImage = () => {
  direction.value = "next";
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
};

const prevImage = () => {
  direction.value = "prev";
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
};

const goToImage = (index: number) => {
  direction.value = index > currentIndex.value ? "next" : "prev";
  currentIndex.value = index;
};

const formatEnumText = (val: string | number) => {
  if (val === undefined || val === null) return "";
  const str = String(val).replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
</script>

<template>
  <RouterLink
    :to="`/projects/${project.id}`"
    class="flex gap-4 p-4 transition-all border border-transparent cursor-pointer group md:flex-col rounded-xl hover:border-border/30 hover:bg-surface-raised hover:-translate-y-1"
  >
    <div
      class="relative overflow-hidden rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video bg-surface"
    >
      <Transition
        :enter-active-class="
          direction === 'next'
            ? 'transition-transform duration-500 ease-in-out'
            : 'transition-transform duration-500 ease-in-out'
        "
        :enter-from-class="direction === 'next' ? 'translate-x-full' : '-translate-x-full'"
        :leave-active-class="
          direction === 'next'
            ? 'transition-transform duration-500 ease-in-out absolute inset-0'
            : 'transition-transform duration-500 ease-in-out absolute inset-0'
        "
        :leave-to-class="direction === 'next' ? '-translate-x-full' : 'translate-x-full'"
      >
        <div :key="currentIndex" class="absolute inset-0 w-full h-full">
          <img
            :src="images[currentIndex]"
            :alt="`${project.name} preview`"
            class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </Transition>
      <div class="absolute top-2 px-2 items-center justify-between w-full hidden md:flex z-10">
        <img
          v-if="project.logoUrl"
          :src="project.logoUrl"
          :alt="`${project.name} logo`"
          class="object-cover rounded-md size-8 shadow-sm bg-surface"
        />
        <div v-else class="size-8"></div>
        <span
          class="text-[10px] py-1 px-2 font-bold uppercase tracking-wider text-white rounded-md bg-background/80 backdrop-blur-sm border border-border/50"
        >
          {{ formatEnumText(project.status) || "Unknown" }}
        </span>
      </div>
      <button
        v-if="images.length > 1"
        @click.prevent="prevImage"
        class="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80 hidden md:block backdrop-blur-sm z-10"
      >
        <IconChevronLeft class="w-5 h-5" />
      </button>
      <button
        v-if="images.length > 1"
        @click.prevent="nextImage"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80 hidden md:block backdrop-blur-sm z-10"
      >
        <IconChevronRight class="w-5 h-5" />
      </button>

      <div
        v-if="images.length > 1"
        class="absolute bottom-2 left-1/2 -translate-x-1/2 gap-1.5 hidden md:flex z-10"
      >
        <button
          v-for="(_, index) in images"
          :key="index"
          @click.prevent="goToImage(index)"
          class="size-1.5 rounded-full transition-all duration-300"
          :class="currentIndex === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'"
        ></button>
      </div>
    </div>

    <div class="flex flex-col flex-1 mt-1">
      <div class="flex items-center justify-between gap-2 mb-2 md:hidden">
        <img
          v-if="project.logoUrl"
          :src="project.logoUrl"
          :alt="`${project.name} logo`"
          class="object-cover border rounded-md size-6 shrink-0 border-border/50 bg-surface"
        />
        <span
          class="text-[9px] py-0.5 px-1.5 font-bold uppercase tracking-wider text-primary rounded border border-primary/20 bg-primary/10"
        >
          {{ formatEnumText(project.status) || "Unknown" }}
        </span>
      </div>

      <h3
        class="mb-2 text-lg font-semibold transition-colors text-content group-hover:text-primary"
      >
        {{ project.name }}
      </h3>
      <p class="text-base font-normal leading-relaxed md:text-sm text-content/70 line-clamp-3">
        {{ project.description }}
      </p>
      <div v-if="project.techStack" class="flex flex-wrap items-center gap-2 mt-3">
        <img
          v-for="(logoUrl, name) in project.techStack"
          :key="name"
          :src="logoUrl"
          :alt="String(name)"
          :title="formatEnumText(name)"
          class="object-contain size-5 opacity-70 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  </RouterLink>
</template>
