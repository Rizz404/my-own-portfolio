<script setup lang="ts">
import { useId } from "vue";
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";

withDefaults(
  defineProps<{
    variant?: "card" | "tile" | "pill" | "grid";
    count?: number;
  }>(),
  {
    variant: "card",
    count: 1,
  },
);

// * @vueuse/motion nyimpen tiap v-motion instance di registry GLOBAL yg di-key pake `node.key`
// punya vnode (liat `motionState` di @vueuse/motion/dist/index.mjs). Kalo :key cuma angka polos
// kayak `i` dari v-for, dan halaman yg sama punya >1 AppSkeleton nyala bareng (misal AboutView:
// skills & experience skeleton keduanya loading pas mount), key mereka bentrok (`1`, `2`, `3`, ...)
// - instance yg baru dibuat manggil `.stop()` ke instance lama yg key-nya sama, jadinya
// skeleton yg lebih awal macet di initial state (invisible) dan cuma sisa yg terakhir ke-render.
// Makanya key-nya di-salt pake useId() biar unik lintas instance/halaman.
const uid = useId();

// * Lebar pill bervariasi biar keliatan natural pas flex-wrap (mirip SkillBadge yg lebarnya ngikutin teks aslinya)
const pillWidths = ["w-14", "w-20", "w-16", "w-24", "w-12", "w-28"];
const pillWidth = (i: number) => pillWidths[(i - 1) % pillWidths.length];

// * Class container per variant. Cuma ada 1 elemen ber-v-motion per iterasi (bukan dipasang di
// tiap cabang v-if/v-else-if) soalnya custom directive kayak v-motion gak reliable kalo dipasang
// di elemen v-else-if di dalem v-for - cabang selain yang pertama gak ke-trigger transition-nya.
const containerClass: Record<"card" | "tile" | "pill" | "grid", string> = {
  card: "flex gap-4 p-4 transition-all border border-transparent md:flex-col rounded-2xl bg-surface/50 animate-pulse",
  tile: "flex items-start gap-4 p-4 border border-transparent rounded-xl bg-surface/50 animate-pulse",
  pill: "flex items-center gap-2 px-3 py-2 border border-transparent rounded-full bg-surface/50 animate-pulse",
  grid: "flex items-center gap-4 p-4 border border-transparent md:flex-col rounded-2xl bg-surface/50 animate-pulse",
};
</script>

<template>
  <div
    v-for="i in count"
    :key="`${uid}-${i}`"
    v-motion="fadeUp(staggerDelay(i - 1))"
    :class="containerClass[variant]"
  >
    <template v-if="variant === 'card'">
      <div
        class="rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video bg-surface-raised"
      ></div>
      <div class="w-full space-y-3">
        <div class="w-1/2 h-4 rounded bg-surface-raised"></div>
        <div class="w-3/4 h-6 rounded bg-surface-raised"></div>
        <div class="w-full h-4 rounded bg-surface-raised"></div>
        <div class="w-5/6 h-4 rounded bg-surface-raised"></div>
      </div>
    </template>

    <template v-else-if="variant === 'tile'">
      <div class="rounded-lg shrink-0 size-12 bg-surface-raised"></div>

      <div class="w-full space-y-3 md:flex md:justify-between md:space-y-0">
        <div class="w-full max-w-sm space-y-3">
          <div class="w-3/4 h-5 rounded bg-surface-raised"></div>
          <div class="w-1/2 h-4 rounded bg-surface-raised"></div>
          <div class="w-full h-4 rounded bg-surface-raised md:mt-4"></div>
        </div>
        <div class="w-1/4 h-4 mt-2 rounded bg-surface-raised md:mt-0"></div>
      </div>
    </template>

    <template v-else-if="variant === 'pill'">
      <div class="rounded-full size-5 shrink-0 bg-surface-raised"></div>
      <div class="h-3 rounded bg-surface-raised" :class="pillWidth(i)"></div>
    </template>

    <template v-else-if="variant === 'grid'">
      <div class="rounded-md shrink-0 size-12 bg-surface-raised"></div>
      <div class="w-full h-3 rounded bg-surface-raised md:w-3/4"></div>
    </template>
  </div>
</template>
