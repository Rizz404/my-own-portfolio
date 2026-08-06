<script setup lang="ts">
import { computed } from "vue";
import { useUsesQuery } from "@/composables/queries/useUses";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import UseCard from "@/components/user/UseCard.vue";
import UseTile from "@/components/user/UseTile.vue";
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
</script>

<template>
  <section class="mt-8 mb-20 md:mt-12">
    <div class="mb-12">
      <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">{{ t("title") }}</h1>
      <p class="max-w-2xl mb-8 text-lg text-content/80">
        {{ t("subtitle") }}
      </p>
    </div>

    <div v-if="isLoading" class="space-y-20">
      <div class="p-6 rounded-3xl bg-surface/20 md:p-8">
        <h2 class="mb-6 text-2xl font-bold text-content">{{ t("hardware") }}</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AppSkeleton variant="card" :count="4" />
        </div>
      </div>

      <div class="p-6 rounded-3xl bg-surface/20 md:p-8">
        <h2 class="mb-6 text-2xl font-bold text-content">{{ t("software") }}</h2>
        <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <AppSkeleton variant="grid" :count="8" />
        </div>
      </div>
    </div>

    <AppError v-else-if="isError" :title="t('errorLoad')" :message="error?.message" />

    <div v-else class="space-y-20">
      <div
        v-if="hardwareList.length > 0"
        v-motion="revealUp()"
        class="p-6 rounded-3xl bg-surface/20 md:p-8"
      >
        <h2 class="mb-6 text-2xl font-bold text-content">{{ t("hardware") }}</h2>
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
        class="p-6 rounded-3xl bg-surface/20 md:p-8"
      >
        <h2 class="mb-6 text-2xl font-bold text-content">{{ t("software") }}</h2>
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
