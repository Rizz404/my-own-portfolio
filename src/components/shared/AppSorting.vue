<script setup lang="ts">
import { computed } from "vue";
import AppSelect from "./AppSelect.vue";
import { ArrowUpWideNarrow, ArrowDownWideNarrow } from "@lucide/vue";
import { resourceSortFields, getSortRule, applySortRule } from "@/utils/sorting";
import type { FilterResource } from "@/utils/advancedFilters";
import type { BaseQueryParams } from "@/types/api";
import { useT } from "@/composables/useT";

const props = defineProps<{ modelValue: object; resource: FilterResource; compact?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: object] }>();
const t = useT("components.shared.AppSorting");
const rule = computed(() => getSortRule(props.modelValue as BaseQueryParams));
const available = computed(() => resourceSortFields[props.resource] as readonly string[]);
const options = computed(() =>
  available.value.map((field) => ({ value: field, label: t(`fields.${field}`) })),
);
const directionLabel = computed(() =>
  t("toggleDirection", {
    current: t(rule.value.direction),
    next: t(rule.value.direction === "asc" ? "desc" : "asc"),
  }),
);
function toggleDirection() {
  update("direction", rule.value.direction === "asc" ? "desc" : "asc");
}
function update(key: "field" | "direction", value: string | number) {
  const next = { ...rule.value };
  if (key === "direction") {
    if (value !== "asc" && value !== "desc") return;
    next.direction = value;
  } else {
    if (!available.value.includes(String(value))) return;
    next.field = String(value);
  }
  emit("update:modelValue", applySortRule(props.modelValue, next));
}
</script>

<template>
  <div class="contents">
    <AppSelect
      :model-value="rule.field"
      :aria-label="t('field')"
      :options="options"
      :class="compact ? 'w-28 sm:w-32 pl-3 pr-8' : 'sm:w-40'"
      @update:model-value="update('field', $event)"
    />
    <button
      type="button"
      :aria-label="directionLabel"
      :title="directionLabel"
      class="flex items-center justify-center self-center transition-colors border cursor-pointer size-11 shrink-0 rounded-xl border-border bg-background text-content hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      @click="toggleDirection"
    >
      <ArrowUpWideNarrow v-if="rule.direction === 'asc'" aria-hidden="true" class="size-5" />
      <ArrowDownWideNarrow v-else aria-hidden="true" class="size-5" />
    </button>
  </div>
</template>
