<script setup lang="ts">
import { RouterView } from "vue-router";
import UserHeader from "@/components/user/UserHeader.vue";
import UserFooter from "@/components/user/UserFooter.vue";
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
  >
    <main class="container min-h-[94vh] flex flex-col relative max-w-7xl w-full">
      <UserHeader />
      <section class="grow">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </section>
      <UserFooter />
    </main>
  </div>
</template>

<style scoped></style>
