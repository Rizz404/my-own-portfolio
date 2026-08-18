<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/shared/AppButton.vue";
import IconCompass from "~icons/lucide/compass";
import { useT } from "@/composables/useT";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/shared/NotFoundView.json
const t = useT("views.shared.NotFoundView");

const route = useRoute();
const router = useRouter();

// * Dipakai buat catch-all "/admin/:pathMatch(.*)*" (router/routes/admin.ts) maupun
// catch-all publik "/:pathMatch(.*)*" (router/routes/user.ts) - biar tombol baliknya
// nyambung ke tempat yang relevan, bukan ke satu tujuan yang sama.
const isAdminArea = computed(() => route.path.startsWith("/admin"));

const goHome = () => {
  router.push(isAdminArea.value ? { name: "AdminDashboard" } : { name: "Home" });
};
</script>

<template>
  <div
    v-motion="fadeUp()"
    class="flex flex-col items-center justify-center min-h-[60vh] py-24 text-center"
  >
    <span class="mb-6 text-6xl text-primary"><IconCompass /></span>
    <p class="mb-2 text-sm font-semibold tracking-widest uppercase text-content/50">
      {{ t("code") }}
    </p>
    <h1 class="mb-3 text-3xl font-extrabold md:text-4xl text-content">{{ t("title") }}</h1>
    <p class="max-w-md mb-8 text-base text-content/70">{{ t("description") }}</p>
    <AppButton variant="primary" @click="goHome">
      {{ isAdminArea ? t("backDashboard") : t("backHome") }}
    </AppButton>
  </div>
</template>
