<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { refDebounced } from "@vueuse/core";
import IconPlus from "~icons/lucide/plus";
import IconTrash2 from "~icons/lucide/trash-2";
import IconListChecks from "~icons/lucide/list-checks";
import IconSearch from "~icons/lucide/search";
import IconFolderKanban from "~icons/lucide/folder-kanban";
import AppButton from "@/components/shared/AppButton.vue";
import AppSelect from "@/components/shared/AppSelect.vue";
import AppCheckbox from "@/components/shared/AppCheckbox.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import AdminProjectCard from "@/components/admin/AdminProjectCard.vue";
import { useProjectsQuery, useDeleteProjectMutation } from "@/composables/queries/useProjects";
import { enumStringKeys } from "@/schemas/shared";
import { ProjectStatus } from "@/types/project";
import type { Project, ProjectQueryParams } from "@/types/project";
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { useQuerySync } from "@/composables/useQuerySync";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/ProjectsView.json
const t = useT("views.admin.ProjectsView");
const toast = useToast();

// * `status` sengaja dikasih key eksplisit (`undefined`) biar ke-detect sama
// useQuerySync() sebagai field yang ikut di-sync ke URL - liat komentar di
// useQuerySync.ts.
const queryParams = ref<ProjectQueryParams>({
  page: 1,
  size: 10,
  search: "",
  status: undefined,
  sortBy: ["createdAt"],
  sortDir: ["desc"],
});

// * Sinkronin queryParams <-> URL query string (?search=...&status=...&sortBy=...
// dst) SEBELUM bikin ref UI di bawah, biar ref-ref itu ke-seed dari value yang
// udah di-override sama URL awal (kalau ada).
useQuerySync(queryParams);

const searchInput = ref(queryParams.value.search ?? "");
const debouncedSearch = refDebounced(searchInput, 500);
const statusFilter = ref(queryParams.value.status ?? "");
const sortByField = ref(queryParams.value.sortBy?.[0] ?? "createdAt");
const sortDirField = ref(queryParams.value.sortDir?.[0] ?? "desc");

watch(debouncedSearch, (value) => {
  queryParams.value.search = value;
  queryParams.value.page = 1;
});

watch(statusFilter, (value) => {
  queryParams.value.status = value || undefined;
  queryParams.value.page = 1;
});

watch([sortByField, sortDirField], ([field, dir]) => {
  queryParams.value.sortBy = [field];
  queryParams.value.sortDir = [dir];
  queryParams.value.page = 1;
});

const {
  data: projectResponse,
  isLoading,
  isError,
  isFetching,
  error,
} = useProjectsQuery(queryParams);

const deleteMutation = useDeleteProjectMutation();

// * Value opsi filter/status pakai nama key enum-nya ("active", "development", dst)
// biar cocok sama `ProjectQueryParams.status: string` & format yang dibalikin backend.
const statusOptions = computed(() => [
  { label: t("filters.allStatuses"), value: "" },
  ...enumStringKeys(ProjectStatus).map((key) => ({ label: formatLabel(key), value: key })),
]);

const sortByOptions = computed(() => [
  { label: t("sort.createdAt"), value: "createdAt" },
  { label: t("sort.updatedAt"), value: "updatedAt" },
  { label: t("sort.name"), value: "name" },
]);

const sortDirOptions = computed(() => [
  { label: t("sort.desc"), value: "desc" },
  { label: t("sort.asc"), value: "asc" },
]);

function formatLabel(value: string | number) {
  return String(value)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
  const totalPages = projectResponse.value?.pagination.totalPages ?? 1;
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
  if (projectResponse.value?.pagination.hasPrevPage) queryParams.value.page!--;
};

const nextPage = () => {
  if (projectResponse.value?.pagination.hasNextPage) queryParams.value.page!++;
};

// * Checkbox seleksi disembunyiin default (UX-nya penuh sesak kalau nongol terus
// di tiap card) - baru muncul pas mode seleksi di-toggle aktif lewat tombol
// "Select". State seleksi ini SENGAJA gak ikut di-reset tiap queryParams
// (search/filter/sort/page/size) berubah, jadi id yang udah dicentang di
// halaman/filter sebelumnya tetep "diinget" walau pindah halaman pagination
// atau ganti filter - baru ke-clear kalau user keluar dari mode seleksi
// (exitSelectionMode) atau item-nya berhasil ke-delete.
const isSelecting = ref(false);
const selectedIds = ref<Set<string>>(new Set());
const isBulkDeleting = ref(false);

const isAllSelectedOnPage = computed(() => {
  const items = projectResponse.value?.data ?? [];
  return items.length > 0 && items.every((project) => selectedIds.value.has(project.id));
});

function toggleSelect(id: string, value: boolean) {
  if (value) selectedIds.value.add(id);
  else selectedIds.value.delete(id);
}

function toggleSelectAllOnPage() {
  const items = projectResponse.value?.data ?? [];
  if (isAllSelectedOnPage.value) {
    items.forEach((project) => selectedIds.value.delete(project.id));
  } else {
    items.forEach((project) => selectedIds.value.add(project.id));
  }
}

function exitSelectionMode() {
  isSelecting.value = false;
  selectedIds.value.clear();
}

async function handleDelete(project: Project) {
  if (!window.confirm(t("confirmDelete", { name: project.name }))) return;

  try {
    await deleteMutation.mutateAsync(project.id);
    selectedIds.value.delete(project.id);
    toast.success(t("toast.deleted"));
  } catch {
    toast.error(t("toast.deleteFailed"));
  }
}

async function handleBulkDelete() {
  const ids = Array.from(selectedIds.value);
  if (ids.length === 0) return;
  if (!window.confirm(t("confirmBulkDelete", { count: ids.length }))) return;

  isBulkDeleting.value = true;
  try {
    const results = await Promise.allSettled(ids.map((id) => deleteMutation.mutateAsync(id)));
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
      <RouterLink :to="{ name: 'AdminProjectCreate' }">
        <AppButton>
          <IconPlus class="mr-1.5 size-4" />
          {{ t("addProject") }}
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
      <AppSelect v-model="statusFilter" :options="statusOptions" class="sm:w-44" />
      <AppSelect v-model="sortByField" :options="sortByOptions" class="sm:w-40" />
      <AppSelect v-model="sortDirField" :options="sortDirOptions" class="sm:w-32" />
    </div>

    <div
      v-if="projectResponse?.data.length"
      class="flex flex-wrap items-center justify-between gap-3 mb-4"
    >
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
      v-else-if="projectResponse?.data.length === 0"
      v-motion="fadeUp()"
      class="py-16 text-center border border-dashed rounded-2xl border-border/50 text-content/60"
    >
      <IconFolderKanban class="mx-auto mb-4 size-12 opacity-20" />
      <p class="text-lg font-medium">{{ t("empty.title") }}</p>
      <p class="text-sm">{{ t("empty.subtitle") }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminProjectCard
        v-for="(project, index) in projectResponse?.data"
        :key="project.id"
        v-motion="fadeUp(staggerDelay(index))"
        :project="project"
        :deleting="deleteMutation.isPending.value"
        :selectable="isSelecting"
        :selected="selectedIds.has(project.id)"
        @delete="handleDelete"
        @update:selected="(value) => toggleSelect(project.id, value)"
      />
    </div>

    <div
      v-if="projectResponse?.data.length"
      class="flex flex-wrap items-center justify-center gap-4 mt-8"
    >
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="!projectResponse?.pagination.hasPrevPage || isFetching"
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
          :max="projectResponse?.pagination.totalPages ?? 1"
          class="w-16 px-2 py-1.5 text-center border outline-none rounded-lg border-border bg-surface text-content focus:border-primary focus:ring-2 focus:ring-primary/50"
          @keyup.enter="applyPage"
          @change="applyPage"
        />
        <span>{{ t("pagination.of") }} {{ projectResponse?.pagination.totalPages ?? 1 }}</span>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        :disabled="!projectResponse?.pagination.hasNextPage || isFetching"
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
        {{ t("pagination.total", { count: projectResponse?.pagination.total ?? 0 }) }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
