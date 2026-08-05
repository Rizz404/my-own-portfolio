<script setup lang="ts">
import IconWarning from "~icons/lucide/triangle-alert";
import { fadeUp } from "@/composables/useMotionPresets";

withDefaults(
  defineProps<{
    title?: string;
    message?: string;
  }>(),
  {
    title: "Oops! Something went wrong",
    message: "Failed to load the content. Please try again later.",
  },
);
</script>

<template>
  <div
    v-motion="fadeUp()"
    class="flex flex-col items-center justify-center py-12 text-center border col-span-full rounded-xl bg-danger/10 border-danger/20"
  >
    <span class="mb-3 text-4xl"><IconWarning /></span>
    <h3 class="mb-1 font-semibold text-danger">{{ title }}</h3>
    <p class="max-w-md text-sm text-danger/80">{{ message }}</p>
  </div>
</template>
