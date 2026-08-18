<script setup lang="ts">
// * Dipakai bareng di ProjectCard.vue, AdminProjectCard.vue, & ProjectDetailView.vue biar
withDefaults(
  defineProps<{
    techStack?: Record<string, string> | null;
    size?: "sm" | "md";
    variant?: "icon" | "text";
  }>(),
  { techStack: null, size: "md", variant: "icon" },
);
</script>

<template>
  <div v-if="techStack && Object.keys(techStack).length" class="flex flex-wrap items-center gap-2">
    <template v-for="(logoUrl, name) in techStack" :key="name">
      <span
        v-if="variant === 'text'"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md bg-surface border-border/50 text-content/70"
      >
        <img
          :src="logoUrl"
          :alt="String(name)"
          loading="lazy"
          class="object-contain shrink-0"
          :class="size === 'sm' ? 'size-3.5' : 'size-4'"
        />
        {{ name }}
      </span>
      <div v-else class="relative group/tech">
        <img
          :src="logoUrl"
          :alt="String(name)"
          loading="lazy"
          class="object-contain transition-opacity opacity-70 group-hover/tech:opacity-100"
          :class="size === 'sm' ? 'size-4' : 'size-5'"
        />
        <span
          class="absolute z-10 px-2 py-1 mb-1.5 text-xs font-medium tracking-wide whitespace-nowrap -translate-x-1/2 -translate-y-1 rounded-md shadow-sm pointer-events-none opacity-0 bottom-full left-1/2 bg-content text-background transition-all duration-150 group-hover/tech:opacity-100 group-hover/tech:translate-y-0"
        >
          {{ name }}
        </span>
      </div>
    </template>
  </div>
</template>
