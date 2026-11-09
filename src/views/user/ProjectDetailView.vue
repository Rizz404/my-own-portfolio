<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import ProjectImageViewer from "@/components/user/ProjectImageViewer.vue";
import { useRoute } from "vue-router";
import { useProjectQuery } from "@/composables/queries/useProjects";
import AppError from "@/components/shared/AppError.vue";
import AppTechStackList from "@/components/shared/AppTechStackList.vue";
import {
  ArrowLeft as IconArrowLeft,
  ExternalLink as IconExternalLink,
  Calendar as IconCalendar,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  Maximize2 as IconMaximize,
} from "@lucide/vue";
import { formatDate } from "@/utils/dateUtil";
import { fadeUp } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { toDisplayHtml } from "@/utils/richText";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/ProjectDetailView.json
const t = useT("views.user.ProjectDetailView");
const { withLocale } = useLocalizedPath();

const route = useRoute();
const projectId = route.params.id as string;

// Fetch Detail Project API
const { data: response, isLoading, isError, error } = useProjectQuery(projectId);

// * Nimpa title generik "Project - Rizqiansyah" (dari App.vue) begitu proyeknya kefetch.
// `onlyWhenPresent` biar diem aja pas masih loading.
useDocumentTitle(
  computed(() => response.value?.data?.name),
  { onlyWhenPresent: true },
);

// * Description disimpan sebagai HTML dari editor WYSIWYG (admin) - disanitasi dulu sebelum
// v-html. Data lama yang masih plain text dibungkus jadi paragraf oleh toDisplayHtml().
const descriptionHtml = computed(() => toDisplayHtml(response.value?.data?.description));

const formatEnumText = (val: string | number) => {
  if (val === undefined || val === null) return;
  const str = String(val).replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// * Status badge color: samain skemanya sama ProjectCard.vue (success/warning/danger/
// info/secondary tergantung status), sebelumnya di sini cuma ada 2 kondisi (primary vs
// netral) jadi gak konsisten sama badge di ProjectCard pas user lompat dari list ke detail.
const statusBadgeClass = computed(() => {
  const status = String(response.value?.data?.status).toLowerCase();
  switch (status) {
    case "active":
      return "bg-success/10 text-success border-success/20";
    case "development":
      return "bg-info/10 text-info border-info/20";
    case "maintenance":
      return "bg-warning/10 text-warning border-warning/20";
    case "archived":
      return "bg-danger/10 text-danger border-danger/20";
    case "inactive":
    default:
      return "bg-surface-raised text-content border-border/50";
  }
});

// * Screenshot strip nav: samain kayak carousel di ProjectCard.vue, tapi tetap
// scroll strip (bukan diganti jadi single-image fade) - cuma ditambah tombol
// & dibuat infinite (loncat balik ke ujung saat sudah mentok).
const imageStripRef = ref<HTMLDivElement | null>(null);

const scrollImageStrip = (dir: "next" | "prev") => {
  const el = imageStripRef.value;
  const firstChild = el?.firstElementChild as HTMLElement | null;
  if (!el || !firstChild) return;

  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
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
const previewIndex = ref<number | null>(null);
const projectImages = computed(() => response.value?.data?.imageUrls ?? []);
let previewTrigger: HTMLButtonElement | null = null;
const openPreview = (index: number, event: MouseEvent) => {
  previewTrigger = event.currentTarget as HTMLButtonElement;
  previewIndex.value = index;
};
const closePreview = async () => {
  previewIndex.value = null;
  await nextTick();
  previewTrigger?.focus({ preventScroll: true });
};
</script>

<template>
  <div class="w-full min-w-0 max-w-4xl mx-auto mt-6 mb-12 md:mt-12 md:mb-20">
    <RouterLink
      :to="withLocale('/projects')"
      class="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors text-content/60 hover:text-success"
    >
      <IconArrowLeft class="w-4 h-4" /> {{ t("back") }}
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

    <AppError v-else-if="isError" :title="t('notFound')" :message="error?.message" />

    <article v-else-if="response?.data" v-motion="fadeUp()">
      <header
        class="flex flex-col gap-5 mb-6 md:gap-6 md:mb-10 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex min-w-0 items-start gap-3 md:items-center md:gap-4">
          <img
            v-if="response.data.logoUrl"
            :src="response.data.logoUrl"
            :alt="`${response.data.name} logo`"
            class="object-cover border shadow-sm size-12 shrink-0 rounded-xl border-border/50 bg-surface md:size-16 md:rounded-2xl"
          />
          <div class="min-w-0">
            <h1
              class="mb-2 break-words text-2xl font-extrabold sm:text-3xl leading-tight md:text-4xl text-content"
            >
              {{ response.data.name }}
            </h1>
            <div class="flex flex-wrap items-center gap-3 text-sm font-medium text-content/60">
              <span
                class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border"
                :class="statusBadgeClass"
              >
                {{ formatEnumText(response.data.status) || t("unknown") }}
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
            <AppTechStackList :tech-stack="response.data.techStack" variant="text" class="mt-2" />
          </div>
        </div>

        <div
          v-if="response.data.projectLinks"
          class="flex w-full shrink-0 flex-wrap gap-2 md:w-auto md:max-w-xs md:gap-3"
        >
          <a
            v-for="(url, label) in response.data.projectLinks"
            :key="label"
            :href="url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-border/50 bg-surface/30 hover:border-success/50 hover:bg-surface text-content hover:text-success"
          >
            {{ formatEnumText(label) }} <IconExternalLink class="w-4 h-4 shrink-0" />
          </a>
        </div>
      </header>

      <div class="mb-8 md:mb-12">
        <div
          v-if="response.data.imageUrls && response.data.imageUrls.length > 0"
          class="relative group"
        >
          <div
            ref="imageStripRef"
            class="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            <button
              v-for="(img, index) in response.data.imageUrls"
              :key="index"
              type="button"
              :aria-label="t('preview.open', { index: index + 1 })"
              class="relative w-full min-w-0 shrink-0 snap-center overflow-hidden rounded-xl border border-border/30 bg-surface shadow-sm cursor-zoom-in focus-visible:outline-2 focus-visible:outline-success md:w-4/5 md:rounded-2xl"
              @click="openPreview(index, $event)"
            >
              <img
                :src="img"
                :alt="`${response.data.name} screenshot ${index + 1}`"
                class="h-64 w-full object-contain sm:h-80 md:h-[28rem]"
              />
              <span class="absolute bottom-3 right-3 rounded-lg bg-[#0009] p-2 text-[#fff]">
                <IconMaximize class="size-4" />
              </span>
            </button>
          </div>
          <button
            v-if="response.data.imageUrls.length > 1"
            @click="scrollImageStrip('prev')"
            type="button"
            :aria-label="t('preview.previous')"
            class="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-content shadow-md ring-1 ring-border transition hover:bg-surface"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <button
            v-if="response.data.imageUrls.length > 1"
            @click="scrollImageStrip('next')"
            type="button"
            :aria-label="t('preview.next')"
            class="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-content shadow-md ring-1 ring-border transition hover:bg-surface"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>
        <img
          v-else
          src="/images/placeholder-project.svg"
          alt="Project Placeholder"
          class="object-cover w-full shadow-md aspect-video rounded-2xl"
        />
      </div>

      <div
        class="min-w-0 break-words text-base leading-relaxed rich-content text-content/90 md:text-lg"
        v-html="descriptionHtml"
      ></div>
    </article>

    <ProjectImageViewer
      :images="projectImages"
      :index="previewIndex"
      :title="response?.data?.name ?? ''"
      @close="closePreview"
      @navigate="previewIndex = $event"
    />
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
