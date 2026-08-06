<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import UserLayout from "@/components/layout/UserLayout.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import BlankLayout from "@/components/layout/BlankLayout.vue";
import AppToastContainer from "@/components/shared/AppToastContainer.vue";

const route = useRoute();
const isAdminLayout = computed(() => route.meta.layout === "admin");
const isBlankLayout = computed(() => route.meta.layout === "blank");
</script>

<!-- * Jangan bingung, artinya cuma UserLayout jadi default -->
<template>
  <AdminLayout v-if="isAdminLayout" />
  <BlankLayout v-else-if="isBlankLayout" />
  <UserLayout v-else />

  <!-- * Global, gak terikat layout - state toast-nya dikelola useToast() -->
  <AppToastContainer />
</template>

<style scoped></style>
