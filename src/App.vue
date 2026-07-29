<script setup lang="ts">
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 py-4 sm:px-6 lg:px-8">
    <main class="container min-h-[94vh] flex flex-col relative">
      <AppHeader />
      <section class="grow">
        <RouterView />
      </section>
      <AppFooter />
    </main>
  </div>
</template>

<style scoped></style>
