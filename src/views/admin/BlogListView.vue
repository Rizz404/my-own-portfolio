<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { refDebounced } from "@vueuse/core";
import IconPlus from "~icons/lucide/plus";
import IconTrash2 from "~icons/lucide/trash-2";
import IconListChecks from "~icons/lucide/list-checks";
import IconSearch from "~icons/lucide/search";
import IconFileText from "~icons/lucide/file-text";
import IconLoader from "~icons/lucide/loader-2";
import AppButton from "@/components/shared/AppButton.vue";
import AppSelect from "@/components/shared/AppSelect.vue";
import AppCheckbox from "@/components/shared/AppCheckbox.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import AdminBlogCard from "@/components/admin/AdminBlogCard.vue";
import { useBlogsQuery, useDeleteBlogMutation } from "@/composables/queries/useBlogs";
import type { Blog, BlogQueryParams } from "@/types/blog";
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useQuerySync } from "@/composables/useQuerySync";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/BlogListView.json
const t = useT("views.admin.BlogListView");
const toast = useToast();
const { confirm } = useConfirm();

const queryParams = ref<BlogQueryParams>({
  page: 1,
  size: 10,
  search: "",
  sortBy: ["createdAt"],
  sortDir: ["desc"],
});

// * Sinkronin queryParams <-> URL query string SEBELUM bikin ref UI di bawah, biar
// ref-ref itu ke-seed dari value yang udah di-override sama URL awal (kalau ada).
useQuerySync(queryParams);

const searchInput = ref(queryParams.value.search ?? "");
const debouncedSearch = refDebounced(searchInput, 500);
const sortByField = ref(queryParams.value.sortBy?.[0] ?? "createdAt");
const sortDirField = ref(queryParams.value.sortDir?.[0] ?? "desc");

watch(debouncedSearch, (value) => {
  queryParams.value.search = value;
  queryParams.value.page = 1;
});

watch([sortByField, sortDirField], ([field, dir]) => {
  queryParams.value.sortBy = [field];
  queryParams.value.sortDir = [dir];
  queryParams.value.page = 1;
});

const { data: blogResponse, isLoading, isError, isFetching, error } = useBlogsQuery(queryParams);

const deleteMutation = useDeleteBlogMutation();

const sortByOptions = computed(() => [
  { label: t("sort.createdAt"), value: "createdAt" },
  { label: t("sort.updatedAt"), value: "updatedAt" },
  { label: t("sort.title"), value: "title" },
]);

const sortDirOptions = computed(() => [
  { label: t("sort.desc"), value: "desc" },
  { label: t("sort.asc"), value: "asc" },
]);

// * Input manual buat page & size (bukan cuma prev/next) - disinkronin balik
// tiap kali queryParams.page berubah (lewat prev/next) biar gak pernah keluar
// sinkron sama server.
const pageInput = ref(queryParams.value.page ?? 1);
const sizeInput = ref(queryParams.value.size ?? 10);

watch(
  () => queryParams.value.page,
  (page) => {
    pageInput.value = page ?? 1;
  },
);

function applyPage() {
  const totalPages = blogResponse.value?.pagination.totalPages ?? 1;
  const clamped = Math.min(Math.max(1, Math.trunc(pageInput.value || 1)), totalPages);
  pageInput.value = clamped;
  queryParams.value.page = clamped;
}

function applySize() {
  const clamped = Math.min(Math.max(1, Math.trunc(sizeInput.value || 1)), 100);
  sizeInput.value = clamped;
  queryParams.value.size = clamped;
  queryParams.value.page = 1;
}

const prevPage = () => {
  if (blogResponse.value?.pagination.hasPrevPage) queryParams.value.page!--;
};

const nextPage = () => {
  if (blogResponse.value?.pagination.hasNextPage) queryParams.value.page!++;
};

// * Checkbox seleksi disembunyiin default, baru muncul pas mode seleksi di-toggle
// aktif lewat tombol "Select". State seleksi SENGAJA gak ikut di-reset tiap
// queryParams berubah - baru ke-clear kalau user keluar dari mode seleksi
// (exitSelectionMode) atau item-nya berhasil ke-delete.
const isSelecting = ref(false);
const selectedIds = ref<Set<string>>(new Set());
const isBulkDeleting = ref(false);

// * Id blog yang lagi diproses hapus SAAT INI - dipake buat (1) nge-guard biar
// handleDelete/handleBulkDelete gak bisa di-trigger ulang buat item yang sama
// selagi masih diproses (klik ganda), (2) disable tombol delete per-card di
// AdminBlogCard.vue (deletingIds.has(blog.id)), dan (3) nentuin kapan floating
// progress indicator di bawah nongol. Diisi baik dari handleDelete (single)
// maupun handleBulkDelete (banyak sekaligus).
const deletingIds = ref<Set<string>>(new Set());
const isDeletingAny = computed(() => deletingIds.value.size > 0);

// * Progress khusus bulk delete (done/total) - dipake floating indicator buat
// nampilin "menghapus X dari Y" pas bulk, beda pesan sama single delete.
// total > 0 nandain lagi ada proses bulk delete yang jalan.
const bulkProgress = ref({ done: 0, total: 0 });

const isAllSelectedOnPage = computed(() => {
  const items = blogResponse.value?.data ?? [];
  return items.length > 0 && items.every((blog) => selectedIds.value.has(blog.id));
});

function toggleSelect(id: string, value: boolean) {
  if (value) selectedIds.value.add(id);
  else selectedIds.value.delete(id);
}

function toggleSelectAllOnPage() {
  const items = blogResponse.value?.data ?? [];
  if (isAllSelectedOnPage.value) {
    items.forEach((blog) => selectedIds.value.delete(blog.id));
  } else {
    items.forEach((blog) => selectedIds.value.add(blog.id));
  }
}

function exitSelectionMode() {
  isSelecting.value = false;
  selectedIds.value.clear();
}

async function handleDelete(blog: Blog) {
  // * Guard: kalau blog ini udah lagi diproses hapus (single ATAU lagi ikut
  // ke-include di bulk delete yang jalan), abaikan klik berikutnya. Tombol
  // delete di card-nya sendiri juga udah di-disable (lihat template) - ini
  // lapisan kedua jaga-jaga (mis. Enter key event / race klik cepat).
  if (deletingIds.value.has(blog.id)) return;

  const confirmed = await confirm({
    title: t("confirmDeleteTitle"),
    message: t("confirmDelete", { name: blog.title }),
    confirmLabel: t("deleteAction"),
    cancelLabel: t("cancelSelection"),
    variant: "danger",
  });
  if (!confirmed) return;

  deletingIds.value.add(blog.id);
  try {
    await deleteMutation.mutateAsync(blog.id);
    selectedIds.value.delete(blog.id);
    toast.success(t("toast.deleted"));
  } catch {
    toast.error(t("toast.deleteFailed"));
  } finally {
    deletingIds.value.delete(blog.id);
  }
}

async function handleBulkDelete() {
  // * Guard: cegah handleBulkDelete ke-trigger dobel (mis. klik cepat
  // berulang) selagi batch sebelumnya masih diproses.
  if (isBulkDeleting.value) return;

  const ids = Array.from(selectedIds.value);
  if (ids.length === 0) return;

  const confirmed = await confirm({
    title: t("confirmBulkDeleteTitle"),
    message: t("confirmBulkDelete", { count: ids.length }),
    confirmLabel: t("deleteSelected"),
    cancelLabel: t("cancelSelection"),
    variant: "danger",
  });
  if (!confirmed) return;

  isBulkDeleting.value = true;
  ids.forEach((id) => deletingIds.value.add(id));
  bulkProgress.value = { done: 0, total: ids.length };

  try {
    const results = await Promise.allSettled(
      ids.map((id) =>
        deleteMutation.mutateAsync(id).finally(() => {
          bulkProgress.value.done++;
          deletingIds.value.delete(id);
        }),
      ),
    );
    const failedCount = results.filter((result) => result.status === "rejected").length;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") selectedIds.value.delete(ids[index]!);
    });

    if (failedCount === 0) {
      toast.success(t("toast.bulkDeleted", { count: ids.length }));
    } else {
      toast.error(t("toast.bulkDeleteFailed", { count: failedCount }));
    }
  } finally {
    isBulkDeleting.value = false;
    // * Safety net - normalnya semua id udah ke-hapus dari deletingIds lewat
    // .finally() di atas satu-satu, ini cuma jaga-jaga kalau ada yang lolos.
    ids.forEach((id) => deletingIds.value.delete(id));
    bulkProgress.value = { done: 0, total: 0 };
  }
}
</script>

<template>
  <div v-motion="fadeUp()">
    <div class="flex flex-col w-full gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-content">{{ t("title") }}</h2>
        <p class="mt-1 text-sm text-content/60">{{ t("subtitle") }}</p>
      </div>
      <RouterLink :to="{ name: 'AdminBlogCreate' }">
        <AppButton>
          <IconPlus class="mr-1.5 size-4" />
          {{ t("addBlog") }}
        </AppButton>
      </RouterLink>
    </div>

    <div class="flex flex-col flex-wrap gap-3 mb-4 sm:flex-row">
      <div class="relative flex-1 min-w-48 group">
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-content/50 group-focus-within:text-primary"
        >
          <IconSearch class="size-4" />
        </div>
        <input
          v-model="searchInput"
          type="text"
          :placeholder="t('searchPlaceholder')"
          class="w-full py-2.5 pl-10 pr-4 transition-all border outline-none bg-surface border-border rounded-xl text-content placeholder:text-content/40 focus:border-primary focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <AppSelect v-model="sortByField" :options="sortByOptions" class="sm:w-40" />
      <AppSelect v-model="sortDirField" :options="sortDirOptions" class="sm:w-32" />
    </div>

    <div v-if="blogResponse?.data.length" class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <template v-if="isSelecting">
        <AppCheckbox
          :model-value="isAllSelectedOnPage"
          :label="t('selectAllOnPage')"
          @update:model-value="toggleSelectAllOnPage"
        />

        <div class="flex items-center gap-3">
          <span v-if="selectedIds.size > 0" class="text-sm font-medium text-content/70">
            {{ t("selectedCount", { count: selectedIds.size }) }}
          </span>
          <AppButton
            v-if="selectedIds.size > 0"
            variant="danger"
            size="sm"
            :disabled="isBulkDeleting"
            @click="handleBulkDelete"
          >
            <IconTrash2 class="mr-1.5 size-4" />
            {{ isBulkDeleting ? t("deleting") : t("deleteSelected") }}
          </AppButton>
          <AppButton variant="secondary" size="sm" @click="exitSelectionMode">
            {{ t("cancelSelection") }}
          </AppButton>
        </div>
      </template>

      <AppButton v-else variant="secondary" size="sm" class="ml-auto" @click="isSelecting = true">
        <IconListChecks class="mr-1.5 size-4" />
        {{ t("selectMode") }}
      </AppButton>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AppSkeleton variant="card" :count="6" />
    </div>

    <AppError v-else-if="isError" :title="t('errorLoad')" :message="error?.message" />

    <div
      v-else-if="blogResponse?.data.length === 0"
      v-motion="fadeUp()"
      class="py-16 text-center border border-dashed rounded-2xl border-border/50 text-content/60"
    >
      <IconFileText class="mx-auto mb-4 size-12 opacity-20" />
      <p class="text-lg font-medium">{{ t("empty.title") }}</p>
      <p class="text-sm">{{ t("empty.subtitle") }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminBlogCard
        v-for="(blog, index) in blogResponse?.data"
        :key="blog.id"
        v-motion="fadeUp(staggerDelay(index))"
        :blog="blog"
        :deleting="deletingIds.has(blog.id)"
        :selectable="isSelecting"
        :selected="selectedIds.has(blog.id)"
        @delete="handleDelete"
        @update:selected="(value) => toggleSelect(blog.id, value)"
      />
    </div>

    <div v-if="blogResponse?.data.length" class="flex flex-wrap items-center justify-center gap-4 mt-8">
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="!blogResponse?.pagination.hasPrevPage || isFetching"
        @click="prevPage"
      >
        &larr; {{ t("pagination.prev") }}
      </AppButton>

      <div class="flex items-center gap-2 text-sm text-content/70">
        <span>{{ t("pagination.page") }}</span>
        <input
          v-model.number="pageInput"
          type="number"
          min="1"
          :max="blogResponse?.pagination.totalPages ?? 1"
          class="w-16 px-2 py-1.5 text-center border outline-none rounded-lg border-border bg-surface text-content focus:border-primary focus:ring-2 focus:ring-primary/50"
          @keyup.enter="applyPage"
          @change="applyPage"
        />
        <span>{{ t("pagination.of") }} {{ blogResponse?.pagination.totalPages ?? 1 }}</span>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        :disabled="!blogResponse?.pagination.hasNextPage || isFetching"
        @click="nextPage"
      >
        {{ t("pagination.next") }} &rarr;
      </AppButton>

      <div class="flex items-center gap-2 text-sm text-content/70">
        <span>{{ t("pagination.size") }}</span>
        <input
          v-model.number="sizeInput"
          type="number"
          min="1"
          max="100"
          class="w-16 px-2 py-1.5 text-center border outline-none rounded-lg border-border bg-surface text-content focus:border-primary focus:ring-2 focus:ring-primary/50"
          @keyup.enter="applySize"
          @change="applySize"
        />
      </div>

      <span class="text-sm text-content/50">
        {{ t("pagination.total", { count: blogResponse?.pagination.total ?? 0 }) }}
      </span>
    </div>

    <!-- * Floating progress indicator - nongol selama ada delete (single ATAU
    bulk) yang lagi diproses, biar user tau prosesnya jalan & gak spam klik
    delete. Teleport ke body biar posisinya fixed relatif ke viewport, bukan
    ke parent yang mungkin punya overflow/transform.
    Wrapper luar cuma buat centering horizontal (-translate-x-1/2) - dipisah
    dari elemen yang di-v-motion soalnya @vueuse/motion nulis transform-nya
    sendiri lewat inline style pas animasi jalan, yang bakal nimpa class
    Tailwind translate-x kalau dipasang di elemen yang sama. -->
    <Teleport to="body">
      <div class="fixed z-40 bottom-6 left-1/2 -translate-x-1/2">
        <div
          v-if="isDeletingAny"
          v-motion="fadeUp()"
          class="flex items-center gap-3 px-4 py-3 border shadow-lg rounded-xl border-border/60 bg-surface text-content"
          role="status"
          aria-live="polite"
        >
          <IconLoader class="shrink-0 size-4 animate-spin text-primary" />
          <span class="text-sm font-medium whitespace-nowrap">
            {{
              bulkProgress.total > 0
                ? t("deleteProgress.bulk", { done: bulkProgress.done, total: bulkProgress.total })
                : t("deleteProgress.single")
            }}
          </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped></style>
