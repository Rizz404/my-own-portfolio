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
    primary: "bg-primary text-content hover:brightness-110 focus:ring-primary/300",
    secondary: "bg-secondary text-content hover:brightness-110 focus:ring-secondary/300",
    success: "bg-success text-content hover:brightness-110 focus:ring-success/300",
    danger: "bg-danger text-content hover:brightness-110 focus:ring-danger/300",
    warning: "bg-warning text-content hover:brightness-110 focus:ring-warning/300",
    info: "bg-info text-content hover:brightness-110 focus:ring-info/300",
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
