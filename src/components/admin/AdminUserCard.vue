<script setup lang="ts">
import { useRouter } from "vue-router";
import { Trash2 as IconTrash2, Loader2 as IconLoader, Calendar as IconCalendar, Check as IconCheck } from "@lucide/vue";
import type User from "@/types/user";
import { formatDate } from "@/utils/dateUtil";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminUserCard.json
const t = useT("components.admin.AdminUserCard");

const props = defineProps<{
  user: User;
  deleting?: boolean;
  selected?: boolean;
  // * Mode seleksi di-toggle dari UserListView.vue. Gak ada checkbox terpisah -
  // pas mode ini aktif, klik card = toggle pilih (bukan masuk edit).
  selectable?: boolean;
}>();

const emit = defineEmits<{
  delete: [user: User];
  "update:selected": [value: boolean];
}>();

const router = useRouter();

function handleCardClick() {
  if (props.selectable) {
    emit("update:selected", !props.selected);
  } else {
    router.push({ name: "AdminUserEdit", params: { id: props.user.id } });
  }
}

const roleBadgeClass = (role: User["role"]) => {
  return String(role).toUpperCase() === "ADMIN" ? "bg-primary text-white" : "bg-secondary text-content";
};
</script>

<template>
  <div
    class="flex flex-col gap-3 p-4 transition-all border cursor-pointer rounded-2xl border-border/60 bg-surface hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md"
    :class="[
      selected ? 'border-primary/60 ring-1 ring-primary/30' : '',
      deleting ? 'opacity-50 pointer-events-none' : '',
    ]"
    role="button"
    :aria-label="selectable ? (selected ? t('deselect') : t('select')) : user.nickname"
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
          v-if="user.profilePict"
          :src="user.profilePict"
          :alt="user.nickname"
          class="object-cover border rounded-full size-11 shrink-0 border-border bg-background"
        />
        <div
          v-else
          class="flex items-center justify-center overflow-hidden text-sm font-semibold text-white border rounded-full size-11 shrink-0 border-border bg-primary"
        >
          {{ user.nickname.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate text-content">{{ user.nickname }}</p>
          <p class="text-xs truncate text-content/50">{{ user.email }}</p>
        </div>
      </div>

      <button
        v-if="!selectable"
        type="button"
        class="p-1.5 rounded-lg shrink-0 text-content/50 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        :disabled="deleting"
        :aria-label="t('delete')"
        @click.stop="emit('delete', user)"
      >
        <IconLoader v-if="deleting" class="size-4 animate-spin" />
        <IconTrash2 v-else class="size-4" />
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <span class="text-[10px] py-1 px-2 font-bold uppercase tracking-wider rounded-md" :class="roleBadgeClass(user.role)">
        {{ user.role }}
      </span>
      <span
        class="text-[10px] py-1 px-2 font-semibold uppercase tracking-wide rounded-full border border-border/50 bg-surface-raised text-content/70"
      >
        {{ user.provider }}
      </span>
    </div>

    <p v-if="user.bio" class="text-sm leading-relaxed text-content/60 line-clamp-2">
      {{ user.bio }}
    </p>

    <div class="flex items-center gap-1.5 pt-3 mt-auto text-xs border-t border-border/50 text-content/50">
      <IconCalendar class="size-3.5" />
      {{ t("updated") }} {{ formatDate(user.updatedAt) }}
    </div>
  </div>
</template>
