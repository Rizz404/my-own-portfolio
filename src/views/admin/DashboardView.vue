<script setup lang="ts">
import { authStores } from "@/stores/authStores";
import { fadeUp } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/DashboardView.json
const t = useT("views.admin.DashboardView");

const authStore = authStores();
</script>

<template>
  <div v-motion="fadeUp()">
    <h2 class="text-2xl font-bold text-content">
      {{ t("greeting", { name: authStore.user?.nickname ?? "" }) }}
    </h2>
    <p class="mt-1 text-content/60">{{ t("subtitle") }}</p>

    <div
      class="flex flex-col items-center justify-center px-4 py-16 mt-8 text-center border border-dashed rounded-card border-border bg-surface/50"
    >
      <p class="font-medium text-content/70">{{ t("placeholderTitle") }}</p>
      <p class="max-w-md mt-1 text-sm text-content/50">{{ t("placeholderMessage") }}</p>
    </div>
  </div>
</template>

<style scoped></style>
