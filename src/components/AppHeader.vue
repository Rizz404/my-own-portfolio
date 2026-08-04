<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import IconLanguages from "~icons/lucide/languages";
import IconSun from "~icons/lucide/sun";
import IconMoon from "~icons/lucide/moon";
import IconMonitor from "~icons/lucide/monitor";
import { useThemeStore } from "@/stores/themeStores";

const navLinks = ref([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Blog", path: "/blogs" },
  { name: "Projects", path: "/projects" },
  { name: "Uses", path: "/uses" },
]);

const themeStore = useThemeStore();
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
        <button
          aria-label="Toggle Language"
          class="p-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary focus:outline-none"
        >
          <IconLanguages class="w-5 h-5" />
        </button>
        <button
          @click="themeStore.toggleTheme()"
          aria-label="Toggle Theme"
          class="p-2 transition-colors rounded-lg text-content/70 hover:bg-surface hover:text-primary focus:outline-none"
        >
          <IconSun v-if="themeStore.currentTheme === 'light'" class="w-5 h-5" />
          <IconMoon v-else-if="themeStore.currentTheme === 'dark'" class="w-5 h-5" />
          <IconMonitor v-else class="w-5 h-5" />
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
</style>
