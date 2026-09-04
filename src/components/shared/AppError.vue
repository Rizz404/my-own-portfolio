<script setup lang="ts">
import { TriangleAlert as IconWarning } from "@lucide/vue";
import { fadeUp } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/shared/AppError.json
const t = useT("views.shared.AppError");

withDefaults(
  defineProps<{
    title?: string;
    message?: string;
  }>(),
  {
    title: undefined,
    message: undefined,
  },
);
</script>

<template>
  <div
    v-motion="fadeUp()"
    class="flex flex-col items-center justify-center py-12 text-center border col-span-full rounded-xl bg-danger/10 border-danger/20"
  >
    <span class="mb-3 text-4xl"><IconWarning /></span>
    <h3 class="mb-1 font-semibold text-danger">{{ title ?? t("defaultTitle") }}</h3>
    <p class="max-w-md text-sm text-danger/80">{{ message ?? t("defaultMessage") }}</p>
  </div>
</template>
