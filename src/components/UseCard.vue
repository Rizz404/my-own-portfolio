<script setup lang="ts">
import type { Use } from "@/types/use";
import { RouterLink } from "vue-router";

defineProps<{ item: Use }>();
</script>

<template>
  <RouterLink
    :to="`/uses/${item.id}`"
    class="flex items-start gap-4 p-4 transition-all border border-transparent group rounded-xl hover:border-border/30 hover:bg-surface-raised"
  >
    <div
      class="flex items-center justify-center p-2 border shrink-0 size-20 rounded-xl bg-surface/50 border-border/20 bg-white/5"
    >
      <img
        v-if="item.logoUrl"
        :src="item.logoUrl"
        :alt="item.itemName"
        class="object-contain w-full h-full"
      />
    </div>
    <div class="flex flex-col">
      <h3 class="font-semibold transition-colors text-content group-hover:text-primary">
        {{ item.itemName }}
      </h3>
      <p class="mt-1 text-sm leading-relaxed text-content/70 line-clamp-2">
        {{ item.reasons }}
      </p>
    </div>
  </RouterLink>
</template>
