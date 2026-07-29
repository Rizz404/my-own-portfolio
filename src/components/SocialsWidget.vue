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
  <section class="mt-8">
    <h3 class="">Conect</h3>
    <div class="flex items-center gap-4 mt-4">
      <a
        v-for="social in socials"
        :key="social.name"
        :href="social.url"
        target="_blank"
        rel="noopener noreferer"
      >
        <div class="flex gap-2">
          <component :is="social.icon" class="size-6" />
          <span class="border-b border-dashed">{{ social.name }}</span>
        </div>
      </a>
    </div>
  </section>
</template>
