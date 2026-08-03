<script setup lang="ts">
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
  >
    <main class="container min-h-[94vh] flex flex-col relative max-w-7xl w-full">
      <AppHeader />
      <section class="grow">
        <RouterView />
      </section>
      <AppFooter />
    </main>
  </div>
</template>

<style scoped></style>
