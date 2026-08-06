<script setup lang="ts">
import { useRouter } from "vue-router";
import IconFolderKanban from "~icons/lucide/folder-kanban";
import IconTrash2 from "~icons/lucide/trash-2";
import IconCalendar from "~icons/lucide/calendar";
import IconCheck from "~icons/lucide/check";
import type Project from "@/types/project";
import { formatDate } from "@/utils/dateUtil";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminProjectCard.json
const t = useT("components.admin.AdminProjectCard");

const props = defineProps<{
  project: Project;
  deleting?: boolean;
  selected?: boolean;
  // * Mode seleksi di-toggle dari ProjectsView.vue. Gak ada checkbox terpisah -
  // pas mode ini aktif, klik card = toggle pilih (bukan masuk edit). Bulatan
  // di kiri cuma indikator visual (gak ikut nangkep klik sendiri), biar satu
  // area klik aja & gak dobel-trigger.
  selectable?: boolean;
}>();

const emit = defineEmits<{
  delete: [project: Project];
  "update:selected": [value: boolean];
}>();

const router = useRouter();

function handleCardClick() {
  if (props.selectable) {
    emit("update:selected", !props.selected);
  } else {
    router.push({ name: "AdminProjectEdit", params: { id: props.project.id } });
  }
}

function formatLabel(value: string | number) {
  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const statusBadgeClass = (status: Project["status"]) => {
  switch (String(status).toLowerCase()) {
    case "active":
      return "bg-success text-white";
    case "development":
      return "bg-info text-white";
    case "maintenance":
      return "bg-warning text-content";
    case "archived":
      return "bg-danger text-white";
    default:
      return "bg-secondary text-content";
  }
};
</script>

<template>
  <div
    class="flex flex-col gap-3 p-4 transition-all border cursor-pointer rounded-2xl border-border/60 bg-surface hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md"
    :class="selected ? 'border-primary/60 ring-1 ring-primary/30' : ''"
    role="button"
    :aria-label="selectable ? (selected ? t('deselect') : t('select')) : project.name"
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
          v-if="project.logoUrl"
          :src="project.logoUrl"
          :alt="`${project.name} logo`"
          class="object-cover border rounded-lg size-11 shrink-0 border-border bg-background"
        />
        <div
          v-else
          class="flex items-center justify-center border rounded-lg size-11 shrink-0 border-border bg-background text-content/30"
        >
          <IconFolderKanban class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate text-content">{{ project.name }}</p>
          <p class="text-xs truncate text-content/50">{{ project.slug }}</p>
        </div>
      </div>

      <button
        v-if="!selectable"
        type="button"
        class="p-1.5 rounded-lg shrink-0 text-content/50 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        :disabled="deleting"
        :aria-label="t('delete')"
        @click.stop="emit('delete', project)"
      >
        <IconTrash2 class="size-4" />
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <span
        class="text-[10px] py-1 px-2 font-bold uppercase tracking-wider rounded-md"
        :class="statusBadgeClass(project.status)"
      >
        {{ formatLabel(project.status) }}
      </span>
      <span
        v-for="type in project.projectTypes"
        :key="type"
        class="text-[10px] py-1 px-2 font-semibold uppercase tracking-wide rounded-full border border-border/50 bg-surface-raised text-content/70"
      >
        {{ formatLabel(type) }}
      </span>
    </div>

    <p v-if="project.description" class="text-sm leading-relaxed text-content/60 line-clamp-2">
      {{ project.description }}
    </p>

    <div class="flex items-center gap-1.5 pt-3 mt-auto text-xs border-t border-border/50 text-content/50">
      <IconCalendar class="size-3.5" />
      {{ t("updated") }} {{ formatDate(project.updatedAt) }}
    </div>
  </div>
</template>
