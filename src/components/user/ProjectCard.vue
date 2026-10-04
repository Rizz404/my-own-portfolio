<script setup lang="ts">
import type Project from "@/types/project";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight } from "@lucide/vue";
import { useT } from "@/composables/useT";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { htmlToPlainText } from "@/utils/richText";
import AppTechStackList from "@/components/shared/AppTechStackList.vue";

const props = defineProps<{ project: Project }>();

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/user/ProjectCard.json
const t = useT("components.user.ProjectCard");
const { withLocale } = useLocalizedPath();

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

// * Status badge color: base on ProjectStatus enum, pakai token warna dari main.css
// (success/warning/danger/info/secondary) - bukan overlay hitam transparan lagi.
const statusBadgeClass = computed(() => {
  const status = String(props.project.status).toLowerCase();
  switch (status) {
    case "active":
      return "bg-success text-white";
    case "development":
      return "bg-info text-white";
    case "maintenance":
      return "bg-warning text-content";
    case "archived":
      return "bg-danger text-white";
    case "inactive":
    default:
      return "bg-secondary text-content";
  }
});
</script>

<template>
  <RouterLink
    :to="withLocale(`/projects/${project.id}`)"
    class="flex min-w-0 flex-col gap-3 p-3 transition-all duration-300 sm:gap-4 sm:p-4 rounded-2xl border border-border/20 bg-surface/30 hover:border-primary/40 hover:bg-surface-raised hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 group"
  >
    <div class="relative overflow-hidden rounded-xl shrink-0 w-full aspect-video bg-surface">
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
            class="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </Transition>
      <div class="absolute top-2 px-2 items-center justify-between w-full flex z-10">
        <img
          v-if="project.logoUrl"
          :src="project.logoUrl"
          :alt="`${project.name} logo`"
          class="object-cover rounded-md size-8 shadow-sm bg-surface"
        />
        <div v-else class="size-8"></div>
        <span
          class="text-[10px] py-1 px-2 font-bold uppercase tracking-wider rounded-md"
          :class="statusBadgeClass"
        >
          {{ formatEnumText(project.status) || t("unknown") }}
        </span>
      </div>
      <button
        v-if="images.length > 1"
        type="button"
        :aria-label="t('previousImage')"
        @click.prevent="prevImage"
        class="absolute left-2 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/70 text-white shadow-sm ring-1 ring-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/90 z-10"
      >
        <IconChevronLeft class="w-5 h-5" />
      </button>
      <button
        v-if="images.length > 1"
        type="button"
        :aria-label="t('nextImage')"
        @click.prevent="nextImage"
        class="absolute right-2 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-black/70 text-white shadow-sm ring-1 ring-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/90 z-10"
      >
        <IconChevronRight class="w-5 h-5" />
      </button>

      <div
        v-if="images.length > 1"
        class="absolute bottom-2 left-1/2 -translate-x-1/2 max-w-[calc(100%-7rem)] items-center overflow-x-auto flex z-10"
      >
        <button
          v-for="(_, index) in images"
          :key="index"
          type="button"
          :aria-label="t('showImage', { index: index + 1 })"
          :aria-current="currentIndex === index ? 'true' : undefined"
          @click.prevent="goToImage(index)"
          class="flex size-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
        >
          <span
            class="h-1.5 rounded-full shadow-sm ring-1 ring-black/20 transition-all duration-300"
            :class="currentIndex === index ? 'bg-white w-4' : 'w-1.5 bg-white/50'"
          ></span>
        </button>
      </div>
    </div>

    <div class="flex min-w-0 flex-col flex-1 mt-1">
      <h3
        class="mb-2 break-words text-lg font-semibold transition-colors text-content group-hover:text-primary"
      >
        {{ project.name }}
      </h3>
      <div
        v-if="project.projectTypes && project.projectTypes.length"
        class="flex flex-wrap gap-1.5 mb-2"
      >
        <span
          v-for="type in project.projectTypes"
          :key="type"
          class="text-[10px] py-0.5 px-2 font-semibold uppercase tracking-wide rounded-full border border-border/50 bg-surface-raised text-content/70"
        >
          {{ formatEnumText(type) }}
        </span>
      </div>
      <p class="break-words text-sm font-normal leading-relaxed text-content/70 line-clamp-3">
        {{ htmlToPlainText(project.description) }}
      </p>
      <AppTechStackList :tech-stack="project.techStack" size="md" class="mt-3" />
    </div>
  </RouterLink>
</template>
