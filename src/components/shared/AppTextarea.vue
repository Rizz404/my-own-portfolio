<script setup lang="ts">
import type { AppTextareaProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed, useId } from "vue";

const props = withDefaults(defineProps<AppTextareaProps>(), {
  id: undefined,
  label: undefined,
  placeholder: undefined,
  rows: 4,
  error: undefined,
  hint: undefined,
  disabled: false,
  required: false,
  class: "",
});

const model = defineModel<string>({ default: "" });

// * Root elemennya `<div>`, jadi listener/atribut yang gak ke-declare sebagai
// prop (@blur, maxlength, dst) dituntun manual ke `<textarea>`-nya - lihat
// AppInput.vue buat alasan lengkapnya.
defineOptions({ inheritAttrs: false });

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);

const textareaClasses = computed(() =>
  twMerge(
    "w-full py-2.5 px-4 bg-background border rounded-xl outline-none transition-all resize-y text-content placeholder:text-content/40 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
    props.error ? "border-danger" : "border-border focus:border-primary",
    props.class,
  ),
);
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="block mb-1.5 text-sm font-medium text-content/80">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </label>

    <textarea
      :id="inputId"
      v-bind="$attrs"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      :class="textareaClasses"
    ></textarea>

    <p v-if="error" :id="errorId" class="mt-1 text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-content/60">{{ hint }}</p>
  </div>
</template>
