<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import UserLayout from "@/components/layout/UserLayout.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import BlankLayout from "@/components/layout/BlankLayout.vue";
import AppToastContainer from "@/components/shared/AppToastContainer.vue";
import AppConfirmDialog from "@/components/shared/AppConfirmDialog.vue";
import { useDocumentTitle } from "@/composables/useDocumentTitle";

const route = useRoute();
const isAdminLayout = computed(() => route.meta.layout === "admin");
const isBlankLayout = computed(() => route.meta.layout === "blank");

// * Title generik per-route, dari meta.titleKey (lihat router/routes/*.ts) -> "Home - Rizqiansyah",
// dst. Reaktif ke pindah route maupun ganti bahasa. Route detail (Blog/Project/Use) nimpa ini
// sendiri pakai judul konten aslinya setelah kefetch (lihat masing-masing view-nya).
const { t } = useI18n();
useDocumentTitle(() => (route.meta.titleKey ? t(route.meta.titleKey) : undefined));
</script>

<!-- * Jangan bingung, artinya cuma UserLayout jadi default -->
<template>
  <AdminLayout v-if="isAdminLayout" />
  <BlankLayout v-else-if="isBlankLayout" />
  <UserLayout v-else />

  <!-- * Global, gak terikat layout - state toast-nya dikelola useToast() -->
  <AppToastContainer />

  <!-- * Global juga - pengganti window.confirm(), state-nya dikelola useConfirm() -->
  <AppConfirmDialog />
</template>

<style scoped></style>
