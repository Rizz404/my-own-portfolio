<script setup lang="ts">
import AppButton from "@/components/shared/AppButton.vue";
import SocialsWidget from "@/components/user/SocialsWidget.vue";
import ExperienceTile from "@/components/user/ExperienceTile.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import { useExperiencesQuery } from "@/composables/queries/useExperiences";
import type { ExperienceQueryParams } from "@/types/experience";
import { ref } from "vue";
import { useT } from "@/composables/useT";
import { fadeUp, revealUp, staggerDelay } from "@/composables/useMotionPresets";

const params = ref<ExperienceQueryParams>({ page: 1, size: 10 });
const { data, isLoading, isError, error } = useExperiencesQuery(params);

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/AboutView.json
const NS = "views.user.AboutView";
const t = useT(NS);
</script>

<template>
  <div class="mt-8 md:mt-12">
    <section class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
      <div class="space-y-6 text-base font-normal leading-relaxed md:text-lg text-content/80">
        <h1 class="mb-6 text-4xl font-extrabold leading-tight md:text-5xl text-content">
          {{ t("hero.titleLine1") }} <br class="hidden md:block" />
          <span class="text-primary">{{ t("hero.titleHighlight") }}</span>
        </h1>

        <p class="font-medium text-content">
          {{ t("hero.greeting") }}
        </p>

        <p>
          {{ t("hero.paragraph1") }}
        </p>

        <i18n-t :keypath="`${NS}.hero.paragraph2`" tag="p">
          <template #techStack>
            <strong class="text-content">{{ t("hero.techStack") }}</strong>
          </template>
        </i18n-t>

        <p>
          {{ t("hero.paragraph3") }}
        </p>

        <p>
          {{ t("hero.usesPagePrefix") }}
          <RouterLink
            to="/uses"
            class="underline transition-colors text-primary hover:text-primary/80"
            >{{ t("hero.usesPageLink") }}</RouterLink
          >.
        </p>
      </div>

      <div v-motion="fadeUp(0.15)" class="grid grid-cols-2 gap-4 mt-8 lg:mt-0 lg:sticky lg:top-24">
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          class="object-cover w-full h-56 transition-transform duration-500 shadow-lg rounded-xl md:h-72 hover:scale-105"
          :alt="t('gallery.workingSetupAlt')"
        />
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          class="object-cover w-full h-56 transition-transform duration-500 shadow-lg rounded-xl md:h-72 hover:scale-105"
          :alt="t('gallery.codingSessionAlt')"
        />
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          class="object-cover w-full h-48 col-span-2 transition-transform duration-500 shadow-lg rounded-xl md:h-64 hover:scale-105"
          :alt="t('gallery.outdoorWorkspaceAlt')"
        />
      </div>
    </section>

    <section class="grid grid-cols-1 gap-12 mt-24 mb-20 lg:grid-cols-3">
      <div v-motion="revealUp()" class="lg:col-span-2">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold md:text-3xl text-content">{{ t("experience.title") }}</h2>
          <AppButton size="sm" variant="secondary" class="rounded-full shadow-sm hover:shadow-md">
            {{ t("experience.downloadResume") }}
          </AppButton>
        </div>

        <AppSkeleton v-if="isLoading" variant="tile" :count="4" />
        <AppError
          v-else-if="isError"
          :title="t('experience.loadError')"
          :message="error?.message"
        />

        <div class="flex flex-col gap-3" v-else>
          <ExperienceTile
            v-for="(experience, index) in data?.data"
            :key="experience.id"
            v-motion="fadeUp(staggerDelay(index))"
            :experience="experience"
          />
        </div>
      </div>

      <div v-motion="revealUp(0.1)" class="lg:col-span-1">
        <div class="p-6 border border-border/30 rounded-2xl bg-surface/30">
          <h2 class="mb-2 text-xl font-bold text-content">{{ t("connect.title") }}</h2>
          <p class="mb-6 text-sm text-content/70">
            {{ t("connect.description") }}
          </p>

          <SocialsWidget class="flex-col items-start! gap-4! mt-0!" />
        </div>
      </div>
    </section>
  </div>
</template>
