<script setup lang="ts">
import { useT } from "@/composables/useT";
import type { Experience } from "@/types/experience";
import { formatDate } from "@/utils/dateUtil"; // Asumsikan kamu punya fungsi ini

defineProps<{ experience: Experience }>();

const t = useT("components.user.ExperienceTile");
</script>

<template>
  <div
    class="flex items-start gap-4 p-4 transition-colors border border-transparent rounded-xl hover:bg-surface-raised hover:border-border/30 group"
  >
    <div
      class="flex items-center justify-center font-bold rounded-lg shrink-0 size-12 bg-primary/10 text-primary"
    >
      {{ experience.companyName.charAt(0) }}
    </div>

    <div class="flex flex-col grow md:flex-row md:justify-between md:items-start">
      <div class="max-w-xl">
        <h4 class="text-lg font-semibold transition-colors text-content group-hover:text-primary">
          {{ experience.position }}
        </h4>
        <p class="text-sm font-medium text-content/80">{{ experience.companyName }}</p>
        <p class="mt-2 text-sm leading-relaxed text-content/70" v-if="experience.description">
          {{ experience.description }}
        </p>
      </div>
      <span class="mt-2 text-xs font-medium md:mt-0 text-content/60 whitespace-nowrap">
        {{ formatDate(experience.startDate) }} &mdash;
        <span v-if="experience.isCurrent" class="text-primary">{{ t("present") }}</span>
        <span v-else>{{ formatDate(experience.endDate || "") }}</span>
      </span>
    </div>
  </div>
</template>
