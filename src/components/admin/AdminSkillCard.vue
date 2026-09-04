<script setup lang="ts">
import { useRouter } from "vue-router";
import { Sparkles as IconSparkles, Trash2 as IconTrash2, Loader2 as IconLoader, Calendar as IconCalendar, Check as IconCheck } from "@lucide/vue";
import type Skill from "@/types/skill";
import { formatDate } from "@/utils/dateUtil";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminSkillCard.json
const t = useT("components.admin.AdminSkillCard");

const props = defineProps<{
  skill: Skill;
  deleting?: boolean;
  selected?: boolean;
  // * Mode seleksi di-toggle dari SkillListView.vue. Gak ada checkbox terpisah -
  // pas mode ini aktif, klik card = toggle pilih (bukan masuk edit).
  selectable?: boolean;
}>();

const emit = defineEmits<{
  delete: [skill: Skill];
  "update:selected": [value: boolean];
}>();

const router = useRouter();

function handleCardClick() {
  if (props.selectable) {
    emit("update:selected", !props.selected);
  } else {
    router.push({ name: "AdminSkillEdit", params: { id: props.skill.id } });
  }
}

function formatLabel(value: string | number) {
  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
</script>

<template>
  <div
    class="flex flex-col gap-3 p-4 transition-all border cursor-pointer rounded-2xl border-border/60 bg-surface hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md"
    :class="[
      selected ? 'border-primary/60 ring-1 ring-primary/30' : '',
      deleting ? 'opacity-50 pointer-events-none' : '',
    ]"
    role="button"
    :aria-label="selectable ? (selected ? t('deselect') : t('select')) : skill.name"
    :aria-pressed="selectable ? selected : undefined"
    @click="handleCardClick"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center flex-1 min-w-0 gap-3">
        <div
          v-if="selectable"
          class="flex items-center justify-center transition-colors border rounded-md size-5 shrink-0"
          :class="selected ? 'bg-primary border-primary text-white' : 'border-border bg-background'"
        >
          <IconCheck v-if="selected" class="size-3.5" />
        </div>
        <img
          v-if="skill.logoUrl"
          :src="skill.logoUrl"
          :alt="`${skill.name} logo`"
          class="object-contain border rounded-lg size-11 shrink-0 border-border bg-background p-1.5"
        />
        <div
          v-else
          class="flex items-center justify-center border rounded-lg size-11 shrink-0 border-border bg-background text-content/30"
        >
          <IconSparkles class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate text-content">{{ skill.name }}</p>
          <p class="text-xs truncate text-content/50">{{ formatLabel(skill.category) }}</p>
        </div>
      </div>

      <button
        v-if="!selectable"
        type="button"
        class="p-1.5 rounded-lg shrink-0 text-content/50 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        :disabled="deleting"
        :aria-label="t('delete')"
        @click.stop="emit('delete', skill)"
      >
        <IconLoader v-if="deleting" class="size-4 animate-spin" />
        <IconTrash2 v-else class="size-4" />
      </button>
    </div>

    <p v-if="skill.description" class="text-sm leading-relaxed text-content/60 line-clamp-2">
      {{ skill.description }}
    </p>

    <div class="flex items-center gap-1.5 pt-3 mt-auto text-xs border-t border-border/50 text-content/50">
      <IconCalendar class="size-3.5" />
      {{ t("updated") }} {{ formatDate(skill.updatedAt) }}
    </div>
  </div>
</template>
