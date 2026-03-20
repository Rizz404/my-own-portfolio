<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import IconClock from "~icons/lucide/clock";

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
</script>

<template>
  <footer class="w-full border-t border-border bg-background/80">
    <div class="mx-auto grid grid-cols-4 max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-4">
      <div class="col-span-2">
        <h3 class="text-content text-lg font-medium">Rizqiansyah Ramadhan</h3>
        <p class="text-sm text-content/80">
          Software Engineering student specializing in backend development, with experience in
          building and managing APIs
        </p>
      </div>
      <div>
        <h4 class="font-medium mb-2">Navigate</h4>
        <nav class="flex flex-wrap gap-4">
          <RouterLink
            class="text-sm font-medium text-content transition-colors hover:text-primary"
            to="/"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/about"
            class="text-sm font-medium text-content transition-colors hover:text-primary"
          >
            About
          </RouterLink>
          <RouterLink
            to="/projects"
            class="text-sm font-medium text-content transition-colors hover:text-primary"
          >
            Projects
          </RouterLink>
          <RouterLink
            to="/uses"
            class="text-sm font-medium text-content transition-colors hover:text-primary"
          >
            Uses
          </RouterLink>
        </nav>
      </div>
      <div>
        <h4 class="font-medium mb-2">Explore</h4>
        <nav class="flex flex-wrap gap-4">
          <!-- <RouterLink
            class="text-sm font-medium text-content transition-colors hover:text-primary"
            to="/"
          >
            Contact
          </RouterLink> -->
          <!-- * Kasih scroll to top -->
        </nav>
      </div>
    </div>
    <div
      class="mx-auto max-w-7xl flex justify-between items-center text-sm text-content/60 px-4 sm:px-6 lg:px-8 py-4"
    >
      <span>&copy; {{ currentYear }}</span>
      <span class="flex items-center gap-1.5" v-if="timeWib">
        <IconClock class="w-4 h-4" />
        {{ timeWib }} WIB
      </span>
    </div>
  </footer>
</template>

<style scoped></style>
