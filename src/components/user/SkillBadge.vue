<script setup lang="ts">
import type { Skill } from "@/types/skill";

defineProps<{ skill: Skill }>();
</script>

<template>
  <div
    :title="skill.description || skill.name"
    class="flex items-center gap-2 px-3 py-2 transition-all duration-300 border rounded-full border-border/20 bg-surface/30 hover:border-primary/40 hover:bg-surface-raised hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 group"
  >
    <img
      v-if="skill.logoUrl"
      :src="skill.logoUrl"
      :alt="skill.name"
      class="object-contain transition-transform duration-300 size-5 group-hover:scale-110"
    />
    <span
      class="text-sm font-medium transition-colors whitespace-nowrap text-content/80 group-hover:text-primary"
    >
      {{ skill.name }}
    </span>
  </div>
</template>
