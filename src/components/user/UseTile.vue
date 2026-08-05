<script setup lang="ts">
import type { Use } from "@/types/use";
import { RouterLink } from "vue-router";

defineProps<{ item: Use }>();
</script>

<template>
  <RouterLink
    :to="`/uses/${item.id}`"
    class="flex gap-4 p-4 transition-all duration-300 md:flex-col rounded-2xl border border-border/20 bg-surface/30 hover:border-primary/40 hover:bg-surface-raised hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 group"
  >
    <img
      v-if="item.logoUrl"
      :src="item.logoUrl"
      :alt="item.itemName"
      class="object-contain transition-transform duration-300 size-12 group-hover:scale-110"
    />
    <span
      class="text-xs font-medium transition-colors text-content/80 group-hover:text-primary line-clamp-1"
    >
      {{ item.itemName }}
    </span>
  </RouterLink>
</template>
