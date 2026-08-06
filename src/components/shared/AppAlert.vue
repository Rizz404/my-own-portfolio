<script setup lang="ts">
import type { AppAlertProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed } from "vue";
import IconCircleCheck from "~icons/lucide/circle-check";
import IconInfo from "~icons/lucide/info";
import IconTriangleAlert from "~icons/lucide/triangle-alert";

// * Banner subtle buat feedback inline (error submit form, notice, dll) -
// bukan pengganti AppError, yang khusus buat state "gagal load konten" full-block.
const props = withDefaults(defineProps<AppAlertProps>(), {
  variant: "danger",
  title: undefined,
  class: "",
});

const icons = {
  danger: IconTriangleAlert,
  warning: IconTriangleAlert,
  success: IconCircleCheck,
  info: IconInfo,
};

const variantClasses = {
  danger: "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  info: "bg-info/10 text-info border-info/20",
};

const alertClasses = computed(() =>
  twMerge(
    "flex items-start gap-2 px-3 py-2 text-sm border rounded-lg",
    variantClasses[props.variant],
    props.class,
  ),
);
</script>

<template>
  <div role="alert" :class="alertClasses">
    <component :is="icons[variant]" class="shrink-0 size-4 mt-0.5" />
    <div>
      <p v-if="title" class="font-medium">{{ title }}</p>
      <p><slot /></p>
    </div>
  </div>
</template>
