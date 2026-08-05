<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useProjectQuery } from "@/composables/queries/useProjects";
import AppError from "@/components/shared/AppError.vue";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconExternalLink from "~icons/lucide/external-link";
import IconCalendar from "~icons/lucide/calendar";
import IconChevronLeft from "~icons/lucide/chevron-left";
import IconChevronRight from "~icons/lucide/chevron-right";
import { formatDate } from "@/utils/dateUtil";
import { fadeUp } from "@/composables/useMotionPresets";

const route = useRoute();
const projectId = route.params.id as string;

// Fetch Detail Project API
const { data: response, isLoading, isError, error } = useProjectQuery(projectId);

const formatEnumText = (val: string | number) => {
  if (val === undefined || val === null) return;
  const str = String(val).replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// * Screenshot strip nav: samain kayak carousel di ProjectCard.vue, tapi tetap
// scroll strip (bukan diganti jadi single-image fade) - cuma ditambah tombol
// & dibuat infinite (loncat balik ke ujung saat sudah mentok).
const imageStripRef = ref<HTMLDivElement | null>(null);

const scrollImageStrip = (dir: "next" | "prev") => {
  const el = imageStripRef.value;
  const firstChild = el?.firstElementChild as HTMLElement | null;
  if (!el || !firstChild) return;

  const gap = 16; // gap-4
  const step = firstChild.offsetWidth + gap;
  const maxScroll = el.scrollWidth - el.clientWidth;

  if (dir === "next") {
    el.scrollTo({
      left: el.scrollLeft >= maxScroll - 10 ? 0 : el.scrollLeft + step,
      behavior: "smooth",
    });
  } else {
    el.scrollTo({
      left: el.scrollLeft <= 10 ? maxScroll : el.scrollLeft - step,
      behavior: "smooth",
    });
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto mt-8 mb-20 md:mt-12">
    <RouterLink
      to="/projects"
      class="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors text-content/60 hover:text-primary"
    >
      <IconArrowLeft class="w-4 h-4" /> Back to all projects
    </RouterLink>

    <div v-if="isLoading" v-motion="fadeUp()" class="space-y-6">
      <div class="w-32 h-4 rounded bg-surface/50 animate-pulse"></div>
      <div class="flex gap-4">
        <div class="size-16 rounded-xl bg-surface/50 animate-pulse"></div>
        <div class="w-3/4 h-12 rounded bg-surface/50 animate-pulse"></div>
      </div>
      <div class="w-full h-64 rounded-xl md:h-96 bg-surface/50 animate-pulse"></div>
      <div class="space-y-4">
        <div class="w-full h-4 rounded bg-surface/50 animate-pulse" v-for="i in 4" :key="i"></div>
      </div>
    </div>

    <AppError v-else-if="isError" title="Project not found" :message="error?.message" />

    <article v-else-if="response?.data" v-motion="fadeUp()">
      <header class="flex flex-col gap-6 mb-10 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <img
            v-if="response.data.logoUrl"
            :src="response.data.logoUrl"
            :alt="`${response.data.name} logo`"
            class="object-cover border shadow-sm size-16 rounded-2xl border-border/50 bg-surface"
          />
          <div>
            <h1 class="mb-2 text-3xl font-extrabold leading-tight md:text-4xl text-content">
              {{ response.data.name }}
            </h1>
            <div class="flex flex-wrap items-center gap-3 text-sm font-medium text-content/60">
              <span
                class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-border/50"
                :class="
                  String(response.data.status).toLowerCase() === 'active' ||
                  String(response.data.status).toLowerCase() === 'completed'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-surface-raised text-content'
                "
              >
                {{ formatEnumText(response.data.status) || "Unknown" }}
              </span>
              <span class="flex items-center gap-1.5" v-if="response.data.createdAt">
                <IconCalendar class="w-4 h-4" /> {{ formatDate(response.data.createdAt) }}
              </span>
            </div>
            <div
              v-if="response.data.projectTypes && response.data.projectTypes.length"
              class="flex flex-wrap items-center gap-2 mt-2"
            >
              <span
                v-for="type in response.data.projectTypes"
                :key="type"
                class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wide border rounded-md border-border/50 bg-surface-raised text-content/70"
              >
                {{ formatEnumText(type) }}
              </span>
            </div>
            <div v-if="response.data.techStack" class="flex flex-wrap items-center gap-2 mt-2">
              <span
                v-for="(logoUrl, name) in response.data.techStack"
                :key="name"
                class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md bg-surface border-border/50 text-content/70"
              >
                <img :src="logoUrl" :alt="String(name)" class="object-contain size-4" />
                {{ formatEnumText(name) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="response.data.projectLinks" class="flex flex-wrap gap-3">
          <a
            v-for="(url, label) in response.data.projectLinks"
            :key="label"
            :href="url"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-border/50 bg-surface/30 hover:border-primary/50 hover:bg-surface text-content hover:text-primary"
          >
            {{ formatEnumText(label) }} <IconExternalLink class="w-4 h-4" />
          </a>
        </div>
      </header>

      <div class="mb-12">
        <div
          v-if="response.data.imageUrls && response.data.imageUrls.length > 0"
          class="relative group"
        >
          <div
            ref="imageStripRef"
            class="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            <img
              v-for="(img, index) in response.data.imageUrls"
              :key="index"
              :src="img"
              :alt="`${response.data.name} screenshot ${index + 1}`"
              class="object-cover w-full border shadow-md shrink-0 snap-center aspect-video rounded-2xl border-border/30 md:w-4/5"
            />
          </div>
          <button
            v-if="response.data.imageUrls.length > 1"
            @click="scrollImageStrip('prev')"
            class="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/70 text-white shadow-sm ring-1 ring-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 hidden md:block z-10"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <button
            v-if="response.data.imageUrls.length > 1"
            @click="scrollImageStrip('next')"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/70 text-white shadow-sm ring-1 ring-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 hidden md:block z-10"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>
        <img
          v-else
          src="https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg"
          alt="Project Placeholder"
          class="object-cover w-full shadow-md aspect-video rounded-2xl"
        />
      </div>

      <div class="text-lg leading-relaxed text-content/90 whitespace-pre-wrap">
        {{ response.data.description }}
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
