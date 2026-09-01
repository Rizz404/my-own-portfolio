<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUseQuery } from "@/composables/queries/useUses";
import AppError from "@/components/shared/AppError.vue";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconExternalLink from "~icons/lucide/external-link";
import { fadeUp } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/UseDetailView.json
const t = useT("views.user.UseDetailView");

const route = useRoute();
const useId = route.params.id as string;

const { data: response, isLoading, isError, error } = useUseQuery(useId);

const formatEnumText = (val: string | number) => {
  if (val === undefined || val === null) return "";
  const str = String(val).replace(/_/g, " ");
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return t("visitLink");
  }
};

// * Badge kategori: samain sama dot di UseView.vue (hardware = danger/maroon, software =
// success/hijau-kuning), biar nyambung pas user lompat dari list ke detail.
const categoryBadgeClass = computed(() => {
  const category = String(response.value?.data?.category).toLowerCase();
  return category === "hardware"
    ? "bg-danger/10 text-danger border-danger/20"
    : "bg-success/10 text-success border-success/20";
});
</script>

<template>
  <div class="max-w-4xl mx-auto mt-8 mb-20 md:mt-12">
    <RouterLink
      to="/uses"
      class="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors text-content/60 hover:text-warning"
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
      <header class="flex flex-col gap-6 mb-10 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center p-2 border shadow-sm shrink-0 size-16 rounded-2xl bg-surface/50 border-border/20"
          >
            <img
              v-if="response.data.logoUrl"
              :src="response.data.logoUrl"
              :alt="`${response.data.itemName} logo`"
              class="object-contain w-full h-full"
            />
          </div>
          <div>
            <h1 class="mb-2 text-3xl font-extrabold leading-tight md:text-4xl text-content">
              {{ response.data.itemName }}
            </h1>
            <div class="flex flex-wrap items-center gap-3 text-sm font-medium text-content/60">
              <span
                class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border"
                :class="categoryBadgeClass"
              >
                {{ formatEnumText(response.data.category) }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="response.data.links && response.data.links.length > 0"
          class="flex flex-wrap gap-3"
        >
          <a
            v-for="(url, index) in response.data.links"
            :key="index"
            :href="url"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-border/50 bg-surface/30 hover:border-warning/50 hover:bg-surface text-content hover:text-warning"
          >
            {{ getDomain(url) }} <IconExternalLink class="w-4 h-4" />
          </a>
        </div>
      </header>

      <div class="mb-12">
        <div
          v-if="response.data.pictures && response.data.pictures.length > 0"
          class="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          <img
            v-for="(img, index) in response.data.pictures"
            :key="index"
            :src="img"
            :alt="`${response.data.itemName} picture ${index + 1}`"
            class="object-cover w-full border shadow-md shrink-0 snap-center aspect-video rounded-2xl border-border/30 md:w-4/5 bg-surface"
          />
        </div>
      </div>

      <div class="text-lg leading-relaxed whitespace-pre-wrap text-content/90">
        {{ response.data.reasons }}
      </div>
    </article>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
