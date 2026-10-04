<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ChevronRight as IconChevronRight } from "@lucide/vue";
import AppInput from "./AppInput.vue";
import AppSelect from "./AppSelect.vue";
import AppMultiSelect from "./AppMultiSelect.vue";
import AppButton from "./AppButton.vue";
import { getFilterFields, type FilterResource } from "@/utils/advancedFilters";
import { useT } from "@/composables/useT";

const props = withDefaults(
  defineProps<{
    modelValue: object;
    resource: FilterResource;
    exclude?: string[];
  }>(),
  { exclude: () => [] },
);
const emit = defineEmits<{ "update:modelValue": [value: object] }>();
const t = useT("components.shared.AppAdvancedFilters");
const fields = computed(() => getFilterFields(props.resource, props.exclude));
const draft = reactive<Record<string, string | number>>({});
const error = ref("");
const panelDetails = ref<HTMLDetailsElement | null>(null);
const activeCount = computed(
  () =>
    fields.value.filter(({ key }) => {
      const value = (props.modelValue as Record<string, unknown>)[key];
      return value !== undefined && value !== null && value !== "";
    }).length,
);
function restore() {
  const params = props.modelValue as Record<string, unknown>;
  for (const field of fields.value) {
    const value = params[field.key];
    if (field.type === "datetime-local" && typeof value === "string" && value) {
      const date = new Date(value);
      draft[field.key] = Number.isNaN(date.getTime())
        ? ""
        : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 23);
    } else draft[field.key] = value === undefined || value === null ? "" : String(value);
  }
}
watch(() => props.modelValue, restore, { deep: true, immediate: true });
function apply() {
  const next: Record<string, unknown> = { ...props.modelValue, page: 1, cursor: undefined };
  for (const field of fields.value) {
    const value = String(draft[field.key] ?? "").trim();
    if (!value) {
      next[field.key] = undefined;
      continue;
    }
    if (field.type === "boolean") next[field.key] = value === "true";
    else if (field.type === "number") {
      const number = Number(value);
      if (!Number.isSafeInteger(number) || number < 0) {
        error.value = t("invalidNumber");
        return;
      }
      next[field.key] = number;
    } else if (field.type === "datetime-local") {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        error.value = t("invalidDate");
        return;
      }
      next[field.key] = date.toISOString();
    } else if (field.key === "ids" || field.key === "techStack") {
      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (field.key === "ids" && values.some((id) => !/^\d+$/.test(id))) {
        error.value = t("invalidIds");
        return;
      }
      next[field.key] = values.length ? values.join(",") : undefined;
    } else next[field.key] = value;
  }
  for (const [from, to] of [
    ["createdFrom", "createdTo"],
    ["updatedFrom", "updatedTo"],
    ["startDate", "endDate"],
    ["dateOfBirthFrom", "dateOfBirthTo"],
    ["minViews", "maxViews"],
  ]) {
    const lower = next[from!];
    const upper = next[to!];
    if (
      lower != null &&
      upper != null &&
      (typeof lower === "number" && typeof upper === "number"
        ? lower > upper
        : String(lower) > String(upper))
    ) {
      error.value = t("invalidRange");
      return;
    }
  }
  error.value = "";
  emit("update:modelValue", next);
  if (panelDetails.value) {
    panelDetails.value.open = false;
    panelDetails.value.querySelector("summary")?.focus({ preventScroll: true });
  }
}
function reset() {
  const next: Record<string, unknown> = { ...props.modelValue, page: 1, cursor: undefined };
  for (const { key } of fields.value) next[key] = undefined;
  error.value = "";
  emit("update:modelValue", next);
}
</script>
<template>
  <div class="relative mb-6">
    <details ref="panelDetails" class="border rounded-xl border-border bg-surface/50 group/filters">
      <summary
        :class="{ 'pr-36': activeCount > 0 }"
        class="flex items-center h-12 gap-2 px-4 text-sm font-medium list-none cursor-pointer text-content focus-visible:outline-primary [&::-webkit-details-marker]:hidden"
      >
        <IconChevronRight
          aria-hidden="true"
          class="transition-transform size-4 shrink-0 group-open/filters:rotate-90 motion-reduce:transition-none"
        />
        <span class="truncate">{{ t("title") }}</span>
        <span v-if="activeCount" class="shrink-0 text-primary">({{ activeCount }})</span>
      </summary>
      <form class="p-4 border-t border-border" @submit.prevent="apply">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <template v-for="field in fields" :key="field.key">
            <AppMultiSelect
              v-if="field.type === 'multi'"
              :model-value="String(draft[field.key] ?? '')"
              :label="t(`fields.${field.key}`)"
              :options="[
                { label: t('all'), value: '' },
                ...(field.values ?? []).map((value) => ({
                  label: value.split('_').join(' '),
                  value,
                })),
              ]"
              @update:model-value="draft[field.key] = $event"
            />
            <AppSelect
              v-else-if="field.type === 'boolean'"
              v-model="draft[field.key]"
              :label="t(`fields.${field.key}`)"
              :options="[
                { label: t('all'), value: '' },
                { label: t('yes'), value: 'true' },
                { label: t('no'), value: 'false' },
              ]"
            />
            <AppInput
              v-else
              v-model="draft[field.key]"
              :type="field.type ?? 'text'"
              :label="t(`fields.${field.key}`)"
              :min="field.type === 'number' ? 0 : undefined"
              :step="
                field.type === 'number' ? 1 : field.type === 'datetime-local' ? '0.001' : undefined
              "
              :hint="
                field.key === 'ids'
                  ? t('idsHint')
                  : field.key === 'techStack'
                    ? t('techHint')
                    : undefined
              "
            />
          </template>
        </div>
        <p v-if="error" role="alert" class="mt-3 text-sm text-danger">{{ error }}</p>
        <div class="flex gap-2 mt-4">
          <AppButton type="submit" size="sm">{{ t("apply") }}</AppButton>
          <AppButton type="button" variant="secondary" size="sm" @click="reset">{{
            t("reset")
          }}</AppButton>
        </div>
      </form>
    </details>
    <div v-if="activeCount" class="absolute flex items-center h-12 top-px right-3">
      <AppButton type="button" variant="secondary" size="sm" @click="reset">
        {{ t("reset") }}
      </AppButton>
    </div>
  </div>
</template>
