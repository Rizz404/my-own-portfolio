<script setup lang="ts">
import { RouterLink } from "vue-router";
import AppButton from "./AppButton.vue";
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300"
  >
    <div class="mx-auto flex h-16 max-w-7xl justify-between items-center px-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-3">
        <img
          src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
          alt=""
          class="object-cover w-8 h-8 ring-2 ring-primary/20 rounded-xs"
        />
        <span class="font-sans font-bold text-content">MyPortfolio</span>
      </RouterLink>
      <nav class="flex gap-6">
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
      <AppButton size="sm">Download CV</AppButton>
    </div>
  </header>
</template>

<style scoped></style>
