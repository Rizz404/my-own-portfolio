<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown as IconChevronDown } from "@lucide/vue";
import type { AppSelectProps } from "@/types/components";
const props = defineProps<Pick<AppSelectProps, "options" | "label">>();
const model = defineModel<string>({ default: "" });
const selected = computed(() => model.value.split(",").filter(Boolean));
const choices = computed(() => props.options.filter((option) => option.value !== ""));
const caption = computed(() => {
  if (!selected.value.length)
    return props.options.find((option) => option.value === "")?.label ?? props.label;
  return selected.value
    .map(
      (value) =>
        choices.value.find((option) => String(option.value).toLowerCase() === value.toLowerCase())
          ?.label ?? value,
    )
    .join(", ");
});
function toggle(value: string, checked: boolean) {
  const next = selected.value.filter((item) => item.toLowerCase() !== value.toLowerCase());
  if (checked) next.push(value);
  model.value = next.join(",");
}
</script>
<template>
  <div>
    <span v-if="label" class="block mb-1.5 text-sm font-medium text-content/80">{{ label }}</span>
    <details class="relative group/multiselect">
      <summary
        class="flex items-center justify-between gap-2 px-4 py-2.5 border rounded-xl border-border bg-background text-content list-none cursor-pointer focus-visible:outline-primary [&::-webkit-details-marker]:hidden"
      >
        <span>{{ caption }}</span>
        <IconChevronDown
          aria-hidden="true"
          class="transition-transform size-4 shrink-0 text-content/40 group-open/multiselect:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div
        class="absolute z-20 w-full min-w-48 max-h-64 overflow-y-auto p-2 mt-1 border shadow-lg rounded-xl bg-surface border-border"
        role="group"
        :aria-label="label ?? caption"
      >
        <button
          v-if="selected.length"
          type="button"
          class="w-full px-2 py-2 text-sm text-left rounded-lg text-primary hover:bg-primary/10"
          @click="model = ''"
        >
          {{ options.find((option) => option.value === "")?.label ?? label }}
        </button>
        <label
          v-for="option in choices"
          :key="option.value"
          class="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer text-content hover:bg-primary/10"
        >
          <input
            type="checkbox"
            class="accent-primary"
            :checked="
              selected.some((value) => value.toLowerCase() === String(option.value).toLowerCase())
            "
            :disabled="option.disabled"
            @change="toggle(String(option.value), ($event.target as HTMLInputElement).checked)"
          />
          {{ option.label }}
        </label>
      </div>
    </details>
  </div>
</template>
