<script setup lang="ts">
import type { Use } from "@/types/use";
import { RouterLink } from "vue-router";

defineProps<{ item: Use }>();
</script>

<template>
  <RouterLink
    :to="`/uses/${item.id}`"
    class="flex flex-col items-center justify-center gap-3 p-4 text-center transition-all border border-transparent group rounded-xl hover:border-border/30 hover:bg-surface-raised"
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
