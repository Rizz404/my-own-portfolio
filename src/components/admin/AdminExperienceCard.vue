<script setup lang="ts">
import { useRouter } from "vue-router";
import IconBriefcase from "~icons/lucide/briefcase";
import IconTrash2 from "~icons/lucide/trash-2";
import IconLoader from "~icons/lucide/loader-2";
import IconCalendar from "~icons/lucide/calendar";
import IconCheck from "~icons/lucide/check";
import type Experience from "@/types/experience";
import { formatDate } from "@/utils/dateUtil";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminExperienceCard.json
const t = useT("components.admin.AdminExperienceCard");

const props = defineProps<{
  experience: Experience;
  deleting?: boolean;
  selected?: boolean;
  // * Mode seleksi di-toggle dari ExperienceListView.vue. Gak ada checkbox terpisah -
  // pas mode ini aktif, klik card = toggle pilih (bukan masuk edit).
  selectable?: boolean;
}>();

const emit = defineEmits<{
  delete: [experience: Experience];
  "update:selected": [value: boolean];
}>();

const router = useRouter();

function handleCardClick() {
  if (props.selectable) {
    emit("update:selected", !props.selected);
  } else {
    router.push({ name: "AdminExperienceEdit", params: { id: props.experience.id } });
  }
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
    :aria-label="selectable ? (selected ? t('deselect') : t('select')) : experience.position"
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
        <div
          class="flex items-center justify-center border rounded-lg size-11 shrink-0 border-border bg-background text-content/30"
        >
          <IconBriefcase class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate text-content">{{ experience.position }}</p>
          <p class="text-xs truncate text-content/50">{{ experience.companyName }}</p>
        </div>
      </div>

      <button
        v-if="!selectable"
        type="button"
        class="p-1.5 rounded-lg shrink-0 text-content/50 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        :disabled="deleting"
        :aria-label="t('delete')"
        @click.stop="emit('delete', experience)"
      >
        <IconLoader v-if="deleting" class="size-4 animate-spin" />
        <IconTrash2 v-else class="size-4" />
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <span
        v-if="experience.isCurrent"
        class="text-[10px] py-1 px-2 font-bold uppercase tracking-wider rounded-md bg-success text-white"
      >
        {{ t("current") }}
      </span>
      <span
        v-for="jobdesk in experience.jobdesks?.slice(0, 3)"
        :key="jobdesk"
        class="text-[10px] py-1 px-2 font-semibold uppercase tracking-wide rounded-full border border-border/50 bg-surface-raised text-content/70"
      >
        {{ jobdesk }}
      </span>
    </div>

    <p v-if="experience.description" class="text-sm leading-relaxed text-content/60 line-clamp-2">
      {{ experience.description }}
    </p>

    <div class="flex items-center gap-1.5 pt-3 mt-auto text-xs border-t border-border/50 text-content/50">
      <IconCalendar class="size-3.5" />
      {{ formatDate(experience.startDate) }} &ndash;
      {{ experience.isCurrent || !experience.endDate ? t("current") : formatDate(experience.endDate) }}
    </div>
  </div>
</template>
