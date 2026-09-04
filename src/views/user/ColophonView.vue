<script setup lang="ts">
import AppButton from "@/components/shared/AppButton.vue";
import IconGithub from "~icons/lucide/github";
import {
  ExternalLink as IconExternalLink,
  Component as IconComponent,
  Database as IconDatabase,
  Languages as IconLanguages,
  MoonStar as IconMoonStar,
} from "@lucide/vue";
import { useT } from "@/composables/useT";
import { fadeUp, revealUp, staggerDelay } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/ColophonView.json
const t = useT("views.user.ColophonView");

// * Konten statis (bukan dari API) - kelompok stack-nya cuma dipake buat nge-grid nama
// tool, translation key label per grup ada di ColophonView.json > stack.groups.<key>
const stackGroups = [
  { key: "framework", items: ["Vue 3", "TypeScript", "Vite", "Vue Router"] },
  { key: "styling", items: ["Tailwind CSS", "Headless UI", "Lucide Icons"] },
  { key: "dataState", items: ["TanStack Query", "Pinia", "Axios", "Zod"] },
  { key: "motionI18n", items: ["VueUse Motion", "Vue I18n", "VueUse Core"] },
];

// * Warna dot gilir sama kayak AboutView.vue (palet Ikuyo Kita: merah rambut, hijau-kuning
// mata, kuning kancing, maroon pita/sepatu), biar section-nya konsisten kalau user lompat
// dari About ke Colophon. Sengaja gak ada warna di luar palet ini (termasuk `info` yang
// biru) - lihat catatan di src/assets/main.css.
const categoryDotColors = ["bg-primary", "bg-success", "bg-warning", "bg-danger"];
const categoryDotClass = (index: number) => categoryDotColors[index % categoryDotColors.length];

const paletteSwatches = [
  { dotClass: "bg-primary", labelKey: "primary" },
  { dotClass: "bg-success", labelKey: "success" },
  { dotClass: "bg-warning", labelKey: "warning" },
  { dotClass: "bg-danger", labelKey: "danger" },
];

// * Kartu "At a Glance" di sebelah intro - satu poin per paragraf intro di atas, dot/badge
// warnanya ngikutin gilirian 4 warna yang sama biar konsisten sama section lain di halaman ini.
const highlights = [
  { key: "componentFirst", icon: IconComponent, accentClass: "bg-primary/10 text-primary" },
  { key: "typedAndCached", icon: IconDatabase, accentClass: "bg-success/10 text-success" },
  { key: "bilingual", icon: IconLanguages, accentClass: "bg-warning/10 text-warning" },
  { key: "adaptive", icon: IconMoonStar, accentClass: "bg-danger/10 text-danger" },
];
</script>

<template>
  <div class="mt-8 mb-20 md:mt-12">
    <section v-motion="fadeUp()">
      <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">{{ t("hero.title") }}</h1>
      <p class="max-w-3xl text-lg text-content/80">{{ t("hero.description") }}</p>
    </section>

    <!-- * Intro - dua paragraf penjelas sebelum masuk ke daftar stack, ditemenin kartu "At
         a Glance" di kanan biar section-nya gak keliatan ngambang sendirian di layar lebar -->
    <section v-motion="revealUp()" class="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-3 lg:items-start">
      <div class="space-y-4 text-base leading-relaxed lg:col-span-2 text-content/80">
        <p>{{ t("intro.paragraph1") }}</p>
        <p>{{ t("intro.paragraph2") }}</p>
      </div>

      <div class="p-6 border rounded-2xl border-border/50 bg-surface/30">
        <h2 class="mb-4 text-sm font-semibold tracking-wide uppercase text-content/60">
          {{ t("intro.highlightsTitle") }}
        </h2>
        <ul class="space-y-4">
          <li v-for="highlight in highlights" :key="highlight.key" class="flex items-start gap-3">
            <span
              class="flex items-center justify-center rounded-full size-8 shrink-0"
              :class="highlight.accentClass"
              aria-hidden="true"
            >
              <component :is="highlight.icon" class="size-4" />
            </span>
            <span class="text-sm leading-relaxed text-content/80">{{
              t(`intro.highlights.${highlight.key}`)
            }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- * Built With -->
    <section class="mt-20">
      <h2 class="mb-8 text-2xl font-bold md:text-3xl text-content">{{ t("stack.title") }}</h2>

      <div class="space-y-8">
        <div
          v-for="(group, index) in stackGroups"
          :key="group.key"
          v-motion="revealUp(staggerDelay(index))"
        >
          <h3
            class="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide uppercase text-content/60"
          >
            <span
              class="rounded-full size-2 shrink-0"
              :class="categoryDotClass(index)"
              aria-hidden="true"
            ></span>
            {{ t(`stack.groups.${group.key}`) }}
          </h3>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="item in group.items"
              :key="item"
              class="px-3 py-2 text-sm font-medium border rounded-full border-border/20 bg-surface/30 text-content/80"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- * Design - 3 kartu: typography, palette warna, motion & aksesibilitas -->
    <section
      v-motion="revealUp()"
      class="grid grid-cols-1 gap-8 p-6 mt-20 rounded-3xl bg-surface/30 md:grid-cols-3 md:p-10"
    >
      <div>
        <h2 class="mb-4 text-xl font-bold text-content">{{ t("design.typography.title") }}</h2>
        <p class="mb-3 text-sm leading-relaxed text-content/80">
          <span class="font-semibold text-content">Plus Jakarta Sans</span>
          {{ t("design.typography.sans") }}
        </p>
        <p class="text-sm leading-relaxed text-content/80">
          <span class="font-mono font-semibold text-content">JetBrains Mono</span>
          {{ t("design.typography.mono") }}
        </p>
      </div>

      <div>
        <h2 class="mb-4 text-xl font-bold text-content">{{ t("design.palette.title") }}</h2>
        <p class="mb-4 text-sm leading-relaxed text-content/70">
          {{ t("design.palette.description") }}
        </p>
        <div class="flex flex-col gap-2.5">
          <div
            v-for="swatch in paletteSwatches"
            :key="swatch.labelKey"
            class="flex items-center gap-2"
          >
            <span
              class="border rounded-full size-4 shrink-0 border-border/20"
              :class="swatch.dotClass"
              aria-hidden="true"
            ></span>
            <span class="text-sm text-content/70">{{
              t(`design.palette.${swatch.labelKey}`)
            }}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 class="mb-4 text-xl font-bold text-content">{{ t("design.craft.title") }}</h2>
        <p class="text-sm leading-relaxed text-content/80">
          {{ t("design.craft.description") }}
        </p>
      </div>
    </section>

    <!-- * Source - aksen danger (maroon, pita/sepatu Ikuyo Kita), dipilih biar section
         penutup ini kerasa identitasnya sendiri tanpa keluar dari palet Kita -->
    <section
      v-motion="revealUp()"
      class="p-6 mt-20 border rounded-2xl border-danger/25 bg-danger/5 md:p-8"
    >
      <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 class="flex items-center gap-2 mb-2 text-xl font-bold text-content">
            <span class="rounded-full size-2 bg-danger shrink-0" aria-hidden="true"></span>
            {{ t("source.title") }}
          </h2>
          <p class="max-w-md text-sm text-content/70">{{ t("source.description") }}</p>
        </div>
        <a href="https://github.com/username" target="_blank" rel="noopener noreferrer">
          <AppButton variant="secondary" class="gap-2 rounded-full shadow-sm hover:shadow-md">
            <IconGithub class="size-4" />
            {{ t("source.viewButton") }}
            <IconExternalLink class="size-3.5" />
          </AppButton>
        </a>
      </div>
    </section>
  </div>
</template>
