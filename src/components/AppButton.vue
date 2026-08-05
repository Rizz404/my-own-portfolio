<script setup lang="ts">
import type { AppButtonProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed } from "vue";

const props = withDefaults(defineProps<AppButtonProps>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  type: "button",
  class: "",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2";

  const variantClasses = {
    primary:
      "bg-primary text-white shadow-sm hover:brightness-110 hover:shadow-md focus:ring-primary/50 focus:border-primary",
    success:
      "bg-success text-white shadow-sm hover:brightness-110 focus:ring-success/50 focus:border-success",
    danger:
      "bg-danger text-white shadow-sm hover:brightness-110 focus:ring-danger/50 focus:border-danger",
    secondary:
      "bg-secondary text-content border border-border/50 shadow-sm hover:bg-surface-raised focus:ring-secondary/50 focus:border-secondary",
    warning:
      "bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 focus:ring-warning/50 focus:border-warning",
    info: "bg-info/10 text-info border border-info/20 hover:bg-info/20 focus:ring-info/50 focus:border-info",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  const stateClasses = props.disabled
    ? "opacity-50 grayscale cursor-not-allowed"
    : "cursor-pointer";

  return twMerge(
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    stateClasses,
    props.class,
  );
});

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) {
    emit("click", e);
  }
};
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses" @click="handleClick">
    <slot />
  </button>
</template>
