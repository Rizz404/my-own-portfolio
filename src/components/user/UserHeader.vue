<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { Languages as IconLanguages, Sun as IconSun, Moon as IconMoon, Monitor as IconMonitor, Check as IconCheck } from "@lucide/vue";
import { useThemeStore } from "@/stores/themeStores";
import { useI18nStore, type LocalePreference } from "@/stores/i18nStores";
import { useT } from "@/composables/useT";

const themeStore = useThemeStore();

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/user/UserHeader.json
const t = useT("components.user.UserHeader");

const i18nStore = useI18nStore();

const navLinks = computed(() => [
  { name: t("nav.home"), path: "/" },
  { name: t("nav.about"), path: "/about" },
  // { name: t("nav.blog"), path: "/blogs" },
  { name: t("nav.projects"), path: "/projects" },
  { name: t("nav.uses"), path: "/uses" },
]);

const languageOptions = computed<{ value: LocalePreference; label: string }[]>(() => [
  { value: "system", label: t("languageSwitcher.system") },
  { value: "en", label: t("languageSwitcher.english") },
  { value: "id", label: t("languageSwitcher.indonesian") },
]);
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full transition-colors duration-300 border-b border-border bg-background/80 backdrop-blur-md"
  >
    <div class="flex items-center justify-between h-16 md:h-20">
      <RouterLink to="/" class="flex items-center gap-3 shrink-0 group">
        <img
          src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
          alt="Logo"
          class="object-cover w-8 h-8 transition-transform duration-300 ring-2 ring-primary/20 rounded-xs group-hover:scale-105"
        />
        <span
          class="hidden font-sans font-bold transition-colors md:block text-content group-hover:text-primary"
        >
          MyPortfolio
        </span>
      </RouterLink>

      <nav
        class="flex items-center flex-1 md:justify-center mx-4 overflow-x-auto md:mx-8 gap-6 scrollbar-hide whitespace-nowrap"
      >
        <RouterLink
          v-for="navLink in navLinks"
          :key="navLink.name"
          :to="navLink.path"
          class="text-sm font-medium transition-colors text-content/70 hover:text-primary nav-link"
        >
          {{ navLink.name }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
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
          aria-label="Toggle Theme"
          class="p-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary focus:outline-none"
        >
          <Transition name="icon-swap" mode="out-in">
            <IconSun v-if="themeStore.currentTheme === 'light'" key="sun" class="w-5 h-5" />
            <IconMoon v-else-if="themeStore.currentTheme === 'dark'" key="moon" class="w-5 h-5" />
            <IconMonitor v-else key="monitor" class="w-5 h-5" />
          </Transition>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Menyembunyikan scrollbar tapi tetap bisa di-scroll */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Styling untuk menu yang sedang aktif */
.nav-link.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 700;
}

/* Swap icon tema (Sun/Moon/Monitor) */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.7) rotate(45deg);
}
</style>
