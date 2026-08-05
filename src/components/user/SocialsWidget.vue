<script setup lang="ts">
import IconGithub from "~icons/lucide/github";
import IconLinkedin from "~icons/lucide/linkedin";
import IconTwitter from "~icons/lucide/twitter";
import IconInstagram from "~icons/lucide/instagram";

const socials = [
  {
    name: "GitHub",
    url: "https://github.com/username",
    icon: IconGithub,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/username",
    icon: IconLinkedin,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/username",
    icon: IconTwitter,
  },
  {
    name: "Instagram",
    url: "https://instagram.com/username",
    icon: IconInstagram,
  },
];
</script>

<template>
  <div class="flex flex-wrap items-center gap-6 mt-8">
    <a
      v-for="social in socials"
      :key="social.name"
      :href="social.url"
      target="_blank"
      rel="noopener noreferer"
      class="flex items-center gap-2 transition-colors text-content/60 hover:text-primary group"
    >
      <component :is="social.icon" class="transition-transform size-5 group-hover:-translate-y-1" />
      <span class="text-sm font-medium">{{ social.name }}</span>
    </a>
  </div>
</template>
