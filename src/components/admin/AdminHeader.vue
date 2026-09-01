<script setup lang="ts">
import { computed } from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import IconMenu from "~icons/lucide/menu";
import IconLanguages from "~icons/lucide/languages";
import IconCheck from "~icons/lucide/check";
import IconSun from "~icons/lucide/sun";
import IconMoon from "~icons/lucide/moon";
import IconMonitor from "~icons/lucide/monitor";
import { useThemeStore } from "@/stores/themeStores";
import { useI18nStore, type LocalePreference } from "@/stores/i18nStores";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminHeader.json
const t = useT("components.admin.AdminHeader");

const emit = defineEmits<{
  openSidebar: [];
}>();

const themeStore = useThemeStore();
const i18nStore = useI18nStore();

const languageOptions = computed<{ value: LocalePreference; label: string }[]>(() => [
  { value: "system", label: t("languageSwitcher.system") },
  { value: "en", label: t("languageSwitcher.english") },
  { value: "id", label: t("languageSwitcher.indonesian") },
]);
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

    <div class="flex items-center gap-1 sm:gap-2">
      <Menu as="div" class="relative">
        <MenuButton
          :aria-label="t('languageSwitcher.ariaLabel')"
          class="flex items-center gap-1 p-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary focus:outline-none"
        >
          <IconLanguages class="w-5 h-5" />
          <span class="hidden text-xs font-semibold uppercase sm:inline">{{
            i18nStore.currentLocale
          }}</span>
        </MenuButton>

        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <MenuItems
            class="absolute right-0 z-50 w-40 py-1 mt-2 overflow-hidden border shadow-lg origin-top-right rounded-xl border-border/50 bg-surface focus:outline-none"
          >
            <MenuItem v-for="option in languageOptions" :key="option.value" v-slot="{ active }">
              <button
                @click="i18nStore.setLocalePreference(option.value)"
                :class="[
                  'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-content/80',
                ]"
              >
                {{ option.label }}
                <IconCheck
                  v-if="i18nStore.localePreference === option.value"
                  class="w-4 h-4 text-primary"
                />
              </button>
            </MenuItem>
          </MenuItems>
        </transition>
      </Menu>

      <button
        @click="themeStore.toggleTheme()"
        :aria-label="t('toggleTheme')"
        class="p-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary focus:outline-none"
      >
        <IconSun v-if="themeStore.currentTheme === 'light'" class="w-5 h-5" />
        <IconMoon v-else-if="themeStore.currentTheme === 'dark'" class="w-5 h-5" />
        <IconMonitor v-else class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>
