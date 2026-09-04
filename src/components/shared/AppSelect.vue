<script setup lang="ts">
import type { AppSelectProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed, useId } from "vue";
import { ChevronDown as IconChevronDown } from "@lucide/vue";

const props = withDefaults(defineProps<AppSelectProps>(), {
  id: undefined,
  label: undefined,
  placeholder: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  required: false,
  class: "",
});

const model = defineModel<string | number>({ default: "" });

// * Root elemennya `<div>`, jadi listener/atribut yang gak ke-declare sebagai
// prop (@blur, @change, dst) dituntun manual ke `<select>`-nya - lihat
// AppInput.vue buat alasan lengkapnya.
defineOptions({ inheritAttrs: false });

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);

const selectClasses = computed(() =>
  twMerge(
    "w-full py-2.5 pl-4 pr-10 bg-background border rounded-xl outline-none appearance-none transition-all text-content focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
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

    <div class="relative">
      <select
        :id="inputId"
        v-bind="$attrs"
        v-model="model"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        :class="selectClasses"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <IconChevronDown
        class="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 size-4 text-content/40"
      />
    </div>

    <p v-if="error" :id="errorId" class="mt-1 text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-content/60">{{ hint }}</p>
  </div>
</template>
