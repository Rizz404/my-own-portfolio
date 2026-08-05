<script setup lang="ts">
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";

withDefaults(
  defineProps<{
    variant?: "card" | "tile";
    count?: number;
  }>(),
  {
    variant: "card",
    count: 1,
  },
);
</script>

<template>
  <template v-for="i in count" :key="i">
    <div
      v-if="variant === 'card'"
      v-motion="fadeUp(staggerDelay(i - 1))"
      class="flex gap-4 p-4 transition-all border border-transparent md:flex-col rounded-xl bg-surface/50 animate-pulse"
    >
      <div
        class="rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video bg-surface-raised"
      ></div>
      <div class="w-full space-y-3">
        <div class="w-1/2 h-4 rounded bg-surface-raised"></div>
        <div class="w-3/4 h-6 rounded bg-surface-raised"></div>
        <div class="w-full h-4 rounded bg-surface-raised"></div>
        <div class="w-5/6 h-4 rounded bg-surface-raised"></div>
      </div>
    </div>

    <div
      v-else-if="variant === 'tile'"
      v-motion="fadeUp(staggerDelay(i - 1))"
      class="flex items-start gap-4 p-4 border border-transparent rounded-xl bg-surface/50 animate-pulse"
    >
      <div class="rounded-lg shrink-0 size-12 bg-surface-raised"></div>

      <div class="w-full space-y-3 md:flex md:justify-between md:space-y-0">
        <div class="w-full max-w-sm space-y-3">
          <div class="w-3/4 h-5 rounded bg-surface-raised"></div>
          <div class="w-1/2 h-4 rounded bg-surface-raised"></div>
          <div class="w-full h-4 rounded bg-surface-raised md:mt-4"></div>
        </div>
        <div class="w-1/4 h-4 mt-2 rounded bg-surface-raised md:mt-0"></div>
      </div>
    </div>
  </template>
</template>
