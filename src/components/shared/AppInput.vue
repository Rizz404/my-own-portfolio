<script setup lang="ts">
import type { AppInputProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed, useId, useSlots } from "vue";

const props = withDefaults(defineProps<AppInputProps>(), {
  type: "text",
  id: undefined,
  label: undefined,
  placeholder: undefined,
  autocomplete: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  required: false,
  class: "",
});

const model = defineModel<string | number>({ default: "" });

// * Root elemennya `<div>` (label + input + pesan error), jadi listener/atribut
// yang gak ke-declare sebagai prop (@blur, @keydown.enter, maxlength, dst)
// harus dituntun manual ke `<input>`-nya, bukan numpang default fallthrough
// ke root div - kalau enggak, `@blur="validateField(...)"` di caller gak
// akan pernah nembak.
defineOptions({ inheritAttrs: false });

const slots = useSlots();

// * `useId()` (Vue 3.5+) biar label ke-link otomatis ke input tanpa maksa
// caller ngasih `id` manual tiap dipake. Kalau caller tetep ngasih `id`
// (misalnya butuh nyambung ke elemen lain), itu yang menang.
const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);

const inputClasses = computed(() =>
  twMerge(
    "w-full py-2.5 px-4 bg-background border rounded-xl outline-none transition-all text-content placeholder:text-content/40 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed",
    slots.append ? "pr-11" : "",
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
      <input
        :id="inputId"
        v-bind="$attrs"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        :class="inputClasses"
      />
      <div v-if="slots.append" class="absolute -translate-y-1/2 right-3 top-1/2">
        <slot name="append" />
      </div>
    </div>

    <p v-if="error" :id="errorId" class="mt-1 text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-content/60">{{ hint }}</p>
  </div>
</template>
