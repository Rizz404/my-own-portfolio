<script setup lang="ts">
import IconGithub from "~icons/lucide/github";
import IconLinkedin from "~icons/lucide/linkedin";
import IconWhatsapp from "~icons/simple-icons/whatsapp";
import IconInstagram from "~icons/lucide/instagram";

const socials = [
  {
    name: "GitHub",
    url: "https://github.com/rizz404",
    icon: IconGithub,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/rizqiansyah-ramadhan-37b0b9313",
    icon: IconLinkedin,
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/+6287778206856",
    icon: IconWhatsapp,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/better_call_rizz",
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
      rel="noopener noreferrer"
      class="flex items-center gap-2 transition-colors text-content/60 hover:text-primary group"
    >
      <component :is="social.icon" class="transition-transform size-5 group-hover:-translate-y-1" />
      <span class="text-sm font-medium">{{ social.name }}</span>
    </a>
  </div>
</template>
