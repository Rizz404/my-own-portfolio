<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import AdminHeader from "@/components/admin/AdminHeader.vue";

const isSidebarOpen = ref(false);
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex flex-col flex-1 min-w-0">
      <AdminHeader @open-sidebar="isSidebarOpen = true" />

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <Transition name="page">
            <component :is="Component" :key="currentRoute.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
