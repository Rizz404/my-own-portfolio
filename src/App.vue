<script setup lang="ts">
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="grow p-6">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped></style>
