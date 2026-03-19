<script setup lang="ts">
import { RouterLink } from "vue-router";
import AppButton from "./AppButton.vue";
</script>

<template>
  <header class="py-4 px-6 border-b">
    <div class="flex justify-between items-center">
      <div>
        <img
          src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
          alt=""
          class="object-cover w-8"
        />
      </div>
      <nav class="flex gap-4">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/projects">Projects</RouterLink>
        <RouterLink to="/uses">Uses</RouterLink>
      </nav>
      <AppButton>Download CV</AppButton>
    </div>
  </header>
</template>

<style scoped></style>
