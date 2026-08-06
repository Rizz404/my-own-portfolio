<script setup lang="ts">
import type { AppAlertProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed } from "vue";
import { alertVariantClasses, alertVariantIcons } from "@/utils/alertVariants";

// * Banner subtle buat feedback inline (error submit form, notice, dll) -
// bukan pengganti AppError, yang khusus buat state "gagal load konten" full-block.
// Ikon & warna per variant sengaja ditaruh di utils/alertVariants.ts biar
// dipake bareng sama AppToastContainer.vue, konsisten.
const props = withDefaults(defineProps<AppAlertProps>(), {
  variant: "danger",
  title: undefined,
  class: "",
});

const alertClasses = computed(() =>
  twMerge(
    "flex items-start gap-2 px-3 py-2 text-sm border rounded-lg",
    alertVariantClasses[props.variant],
    props.class,
  ),
);
</script>

<template>
  <div role="alert" :class="alertClasses">
    <component :is="alertVariantIcons[variant]" class="shrink-0 size-4 mt-0.5" />
    <div>
      <p v-if="title" class="font-medium">{{ title }}</p>
      <p><slot /></p>
    </div>
  </div>
</template>
