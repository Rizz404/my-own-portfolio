<script setup lang="ts">
import { useRouter } from "vue-router";
import IconFileText from "~icons/lucide/file-text";
import IconTrash2 from "~icons/lucide/trash-2";
import IconLoader from "~icons/lucide/loader-2";
import IconCalendar from "~icons/lucide/calendar";
import IconCheck from "~icons/lucide/check";
import IconEye from "~icons/lucide/eye";
import IconThumbsUp from "~icons/lucide/thumbs-up";
import type Blog from "@/types/blog";
import { formatDate } from "@/utils/dateUtil";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminBlogCard.json
const t = useT("components.admin.AdminBlogCard");

const props = defineProps<{
  blog: Blog;
  deleting?: boolean;
  selected?: boolean;
  // * Mode seleksi di-toggle dari BlogsView.vue. Gak ada checkbox terpisah -
  // pas mode ini aktif, klik card = toggle pilih (bukan masuk edit).
  selectable?: boolean;
}>();

const emit = defineEmits<{
  delete: [blog: Blog];
  "update:selected": [value: boolean];
}>();

const router = useRouter();

function handleCardClick() {
  if (props.selectable) {
    emit("update:selected", !props.selected);
  } else {
    router.push({ name: "AdminBlogEdit", params: { id: props.blog.id } });
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
    :aria-label="selectable ? (selected ? t('deselect') : t('select')) : blog.title"
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
          v-if="blog.featuredImage"
          :src="blog.featuredImage"
          :alt="blog.title"
          class="object-cover border rounded-lg size-11 shrink-0 border-border bg-background"
        />
        <div
          v-else
          class="flex items-center justify-center border rounded-lg size-11 shrink-0 border-border bg-background text-content/30"
        >
          <IconFileText class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate text-content">{{ blog.title }}</p>
          <p class="text-xs truncate text-content/50">{{ blog.slug }}</p>
        </div>
      </div>

      <button
        v-if="!selectable"
        type="button"
        class="p-1.5 rounded-lg shrink-0 text-content/50 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
        :disabled="deleting"
        :aria-label="t('delete')"
        @click.stop="emit('delete', blog)"
      >
        <IconLoader v-if="deleting" class="size-4 animate-spin" />
        <IconTrash2 v-else class="size-4" />
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <span
        class="text-[10px] py-1 px-2 font-bold uppercase tracking-wider rounded-md"
        :class="blog.isPublished ? 'bg-success text-white' : 'bg-secondary text-content'"
      >
        {{ blog.isPublished ? t("published") : t("draft") }}
      </span>
    </div>

    <p v-if="blog.content" class="text-sm leading-relaxed text-content/60 line-clamp-2">
      {{ blog.content }}
    </p>

    <div class="flex items-center gap-4 pt-3 mt-auto text-xs border-t border-border/50 text-content/50">
      <span class="flex items-center gap-1">
        <IconEye class="size-3.5" />
        {{ blog.viewsCount }}
      </span>
      <span class="flex items-center gap-1">
        <IconThumbsUp class="size-3.5" />
        {{ blog.likesCount }}
      </span>
      <span class="flex items-center gap-1 ml-auto">
        <IconCalendar class="size-3.5" />
        {{ formatDate(blog.updatedAt) }}
      </span>
    </div>
  </div>
</template>
