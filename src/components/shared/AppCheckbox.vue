<script setup lang="ts">
import type { AppCheckboxProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed, useId } from "vue";

const props = withDefaults(defineProps<AppCheckboxProps>(), {
  id: undefined,
  label: undefined,
  error: undefined,
  disabled: false,
  class: "",
});

const model = defineModel<boolean>({ default: false });

// * Root elemennya `<div>`, jadi listener/atribut yang gak ke-declare sebagai
// prop (@blur, @change, dst) dituntun manual ke `<input>`-nya - lihat
// AppInput.vue buat alasan lengkapnya.
defineOptions({ inheritAttrs: false });

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

const checkboxClasses = computed(() =>
  twMerge(
    "size-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
    props.error ? "border-danger" : "",
    props.class,
  ),
);
</script>

<template>
  <div>
    <label :for="inputId" class="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        :id="inputId"
        v-bind="$attrs"
        v-model="model"
        type="checkbox"
        :disabled="disabled"
        :aria-invalid="!!error"
        :class="checkboxClasses"
      />
      <span v-if="label" class="text-sm text-content/80">{{ label }}</span>
    </label>

    <p v-if="error" class="mt-1 text-xs text-danger">{{ error }}</p>
  </div>
</template>
