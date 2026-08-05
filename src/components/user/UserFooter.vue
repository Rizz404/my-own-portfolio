<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import IconClock from "~icons/lucide/clock";
import SocialsWidget from "@/components/user/SocialsWidget.vue";

const currentYear = new Date().getFullYear();

const timeWib = ref("");
const updateTime = () => {
  timeWib.value = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
};

let timer: number | undefined;
onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const navigateLinks = ref([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Blog", path: "/blogs" },
  { name: "Projects", path: "/projects" },
  { name: "Uses", path: "/uses" },
]);

const exploreLinks = ref([
  { name: "Colophon", path: "/colophon" },
  { name: "Contact", path: "/contact" },
]);
</script>

<template>
  <footer class="w-full mt-16 border-t border-border bg-background/50">
    <div class="py-8 md:py-12">
      <!-- Grid utama: 1 kolom di mobile, 12 kolom di desktop -->
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <!-- Brand, Bio & Socials (Diperlebar menjadi 7 kolom) -->
        <div class="flex flex-col gap-6 lg:col-span-7 lg:pr-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <img
                src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
                alt="Logo"
                class="object-cover w-6 h-6 rounded-full ring-1 ring-primary/20"
              />
              <h3 class="text-lg font-bold text-content">Rizqiansyah Ramadhan</h3>
            </div>
            <!-- max-w-md dihapus agar teks mengalir mengisi lebar kolom -->
            <p class="text-base leading-relaxed text-content/70">
              Software Engineering student specializing in backend development, with experience in
              building and managing APIs. Building scalable systems with code and coffee.
            </p>
          </div>

          <SocialsWidget class="gap-4!" />
        </div>

        <!-- Links Container (Dibungkus grid 2 kolom agar selalu sejajar) -->
        <div class="grid grid-cols-2 gap-8 lg:col-span-5 sm:gap-12">
          <!-- Navigate Links -->
          <div>
            <h4 class="mb-6 text-sm font-bold tracking-wider uppercase text-content">Navigate</h4>
            <nav class="flex flex-col gap-3">
              <RouterLink
                v-for="navigateLink in navigateLinks"
                :key="navigateLink.name"
                :to="navigateLink.path"
                class="flex items-center gap-2 text-base font-medium transition-colors text-content/70 hover:text-primary nav-link"
              >
                <span class="text-content/40">&bull;</span> {{ navigateLink.name }}
              </RouterLink>
            </nav>
          </div>

          <!-- Explore Links & Actions -->
          <div>
            <h4 class="mb-6 text-sm font-bold tracking-wider uppercase text-content">Explore</h4>
            <nav class="flex flex-col items-start gap-3">
              <RouterLink
                v-for="exploreLink in exploreLinks"
                :key="exploreLink.name"
                :to="exploreLink.path"
                class="flex items-center gap-2 text-base font-medium transition-colors text-content/70 hover:text-primary nav-link"
              >
                <span class="text-content/40">&bull;</span> {{ exploreLink.name }}
              </RouterLink>
              <button
                @click="scrollToTop"
                class="flex items-center gap-2 text-base font-medium transition-colors text-content/70 hover:text-primary focus:outline-none"
              >
                <span class="text-content/40">&bull;</span> Scroll to Top
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar (Copyright & Time) -->
    <div class="py-6 border-t border-border/50">
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row text-content/60">
        <span class="text-sm font-medium">&copy; {{ currentYear }} All rights reserved.</span>
        <span class="flex items-center gap-2 text-sm font-medium" v-if="timeWib">
          <IconClock class="w-4 h-4 text-primary" />
          {{ timeWib }} WIB
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Styling untuk menu yang aktif */
.nav-link.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
