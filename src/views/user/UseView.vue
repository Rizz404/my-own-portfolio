<script setup lang="ts">
import { computed } from "vue";
import { useUsesQuery } from "@/composables/queries/useUses";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import UseCard from "@/components/user/UseCard.vue";
import UseTile from "@/components/user/UseTile.vue";
import { Wrench as IconWrench } from "@lucide/vue";
import { fadeUp, revealUp, staggerDelay } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/UseView.json
const t = useT("views.user.UseView");

const { data: response, isLoading, isError, error } = useUsesQuery({ size: 100 });

const hardwareList = computed(() => {
  if (!response.value?.data) return [];
  return response.value.data.filter((item) => String(item.category).toLowerCase() === "hardware");
});

const softwareList = computed(() => {
  if (!response.value?.data) return [];
  return response.value.data.filter((item) => String(item.category).toLowerCase() === "software");
});

const isEmpty = computed(
  () => hardwareList.value.length === 0 && softwareList.value.length === 0,
);
</script>

<template>
  <section class="mt-8 mb-20 md:mt-12">
    <div class="flex flex-col gap-6 mb-12 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">{{ t("title") }}</h1>
        <p class="max-w-3xl text-lg text-content/80">
          {{ t("subtitle") }}
        </p>
      </div>

      <!-- * Pill jumlah item per kategori - ngisi ruang kanan yang tadinya kosong pas subtitle
           di kiri gak sampe selebar section, sekalian kasih info sekilas jumlah gear -->
      <div v-if="!isLoading && !isError && !isEmpty" class="flex flex-wrap gap-3 shrink-0">
        <div
          v-if="hardwareList.length > 0"
          class="flex items-center gap-2 px-4 py-2 border rounded-full border-danger/25 bg-danger/5"
        >
          <span class="rounded-full size-2 bg-danger shrink-0" aria-hidden="true"></span>
          <span class="text-sm font-medium text-content/80">
            {{ t("stats.hardware", { count: hardwareList.length }) }}
          </span>
        </div>
        <div
          v-if="softwareList.length > 0"
          class="flex items-center gap-2 px-4 py-2 border rounded-full border-success/25 bg-success/5"
        >
          <span class="rounded-full size-2 bg-success shrink-0" aria-hidden="true"></span>
          <span class="text-sm font-medium text-content/80">
            {{ t("stats.software", { count: softwareList.length }) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-20">
      <div class="p-6 rounded-3xl bg-danger/8 md:p-8">
        <h2 class="flex items-center gap-2.5 mb-6 text-2xl font-bold text-content">
          <span class="rounded-full size-2.5 bg-danger shrink-0" aria-hidden="true"></span>
          {{ t("hardware") }}
        </h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AppSkeleton variant="card" :count="4" />
        </div>
      </div>

      <div class="p-6 rounded-3xl bg-success/8 md:p-8">
        <h2 class="flex items-center gap-2.5 mb-6 text-2xl font-bold text-content">
          <span class="rounded-full size-2.5 bg-success shrink-0" aria-hidden="true"></span>
          {{ t("software") }}
        </h2>
        <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <AppSkeleton variant="grid" :count="8" />
        </div>
      </div>
    </div>

    <AppError v-else-if="isError" :title="t('errorLoad')" :message="error?.message" />

    <div
      v-else-if="isEmpty"
      v-motion="fadeUp()"
      class="py-16 text-center border border-dashed rounded-2xl border-border/50 text-content/60"
    >
      <IconWrench class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">{{ t("empty.title") }}</p>
      <p class="text-sm">{{ t("empty.subtitle") }}</p>
    </div>

    <div v-else class="space-y-20">
      <div
        v-if="hardwareList.length > 0"
        v-motion="revealUp()"
        class="p-6 rounded-3xl bg-danger/8 md:p-8"
      >
        <!-- * Aksen maroon (danger - pita/sepatu Kita) + background di-tint tipis, buat
             kategori Hardware -->
        <h2 class="flex items-center gap-2.5 mb-6 text-2xl font-bold text-content">
          <span class="rounded-full size-2.5 bg-danger shrink-0" aria-hidden="true"></span>
          {{ t("hardware") }}
        </h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UseCard
            v-for="(item, index) in hardwareList"
            :key="item.id"
            v-motion="fadeUp(staggerDelay(index))"
            :item="item"
          />
        </div>
      </div>

      <div
        v-if="softwareList.length > 0"
        v-motion="revealUp()"
        class="p-6 rounded-3xl bg-success/8 md:p-8"
      >
        <!-- * Aksen success (hijau-kuning, mata Kita) + background di-tint tipis, buat
             kategori Software -->
        <h2 class="flex items-center gap-2.5 mb-6 text-2xl font-bold text-content">
          <span class="rounded-full size-2.5 bg-success shrink-0" aria-hidden="true"></span>
          {{ t("software") }}
        </h2>
        <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <UseTile
            v-for="(item, index) in softwareList"
            :key="item.id"
            v-motion="fadeUp(staggerDelay(index))"
            :item="item"
          />
        </div>
      </div>
    </div>
  </section>
</template>
