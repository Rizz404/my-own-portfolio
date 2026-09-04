<script setup lang="ts">
import type { AppPasswordInputProps } from "@/types/components";
import { ref } from "vue";
import { Eye as IconEye, EyeOff as IconEyeOff } from "@lucide/vue";
import AppInput from "@/components/shared/AppInput.vue";

// * Tipis banget di atas AppInput - cuma nambahin state + tombol toggle
// visibility. Label tombolnya sengaja dibikin prop (bukan `useT()` sendiri)
// biar teksnya ngikutin namespace i18n view pemanggil, bukan namespace baru
// per komponen.
const props = withDefaults(defineProps<AppPasswordInputProps>(), {
  id: undefined,
  label: undefined,
  placeholder: undefined,
  autocomplete: "current-password",
  error: undefined,
  hint: undefined,
  disabled: false,
  required: false,
  showPasswordLabel: "Show password",
  hidePasswordLabel: "Hide password",
  class: "",
});

const model = defineModel<string>({ default: "" });

const isVisible = ref(false);
</script>

<template>
  <AppInput
    v-model="model"
    :type="isVisible ? 'text' : 'password'"
    :id="id"
    :label="label"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :required="required"
    :class="props.class"
  >
    <template #append>
      <button
        type="button"
        :aria-label="isVisible ? hidePasswordLabel : showPasswordLabel"
        class="text-content/40 hover:text-content/70"
        @click="isVisible = !isVisible"
      >
        <IconEyeOff v-if="isVisible" class="w-5 h-5" />
        <IconEye v-else class="w-5 h-5" />
      </button>
    </template>
  </AppInput>
</template>
