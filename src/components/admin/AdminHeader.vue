<script setup lang="ts">
import IconMenu from "~icons/lucide/menu";
import IconSun from "~icons/lucide/sun";
import IconMoon from "~icons/lucide/moon";
import IconMonitor from "~icons/lucide/monitor";
import { useThemeStore } from "@/stores/themeStores";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminHeader.json
const t = useT("components.admin.AdminHeader");

const emit = defineEmits<{
  openSidebar: [];
}>();

const themeStore = useThemeStore();
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-border bg-background/80 backdrop-blur-md sm:px-6"
  >
    <div class="flex items-center gap-3">
      <button
        @click="emit('openSidebar')"
        :aria-label="t('openSidebar')"
        class="p-2 -ml-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary lg:hidden"
      >
        <IconMenu class="w-5 h-5" />
      </button>
      <h1 class="text-sm font-semibold sm:text-base text-content">
        {{ t("title") }}
      </h1>
    </div>

    <button
      @click="themeStore.toggleTheme()"
      :aria-label="t('toggleTheme')"
      class="p-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary focus:outline-none"
    >
      <IconSun v-if="themeStore.currentTheme === 'light'" class="w-5 h-5" />
      <IconMoon v-else-if="themeStore.currentTheme === 'dark'" class="w-5 h-5" />
      <IconMonitor v-else class="w-5 h-5" />
    </button>
  </header>
</template>
