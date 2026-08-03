<script setup lang="ts">
import { ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import { useProjectsQuery } from "@/composables/queries/useProjects";
import type { ProjectQueryParams } from "@/types/project";
import ProjectCard from "@/components/ProjectCard.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import AppError from "@/components/AppError.vue";
import AppButton from "@/components/AppButton.vue";
import IconSearch from "~icons/lucide/search";

const searchInput = ref("");
const debouncedSearch = refDebounced(searchInput, 500);

const queryParams = ref<ProjectQueryParams>({
  page: 1,
  size: 12,
  search: "",
  sortBy: ["createdAt"],
  sortDir: ["desc"],
});

watch(debouncedSearch, (newVal) => {
  queryParams.value.search = newVal;
  queryParams.value.page = 1;
});

const {
  data: projectResponse,
  isLoading,
  isError,
  isFetching,
  error,
} = useProjectsQuery(queryParams);

const handleSortChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  queryParams.value.page = 1;

  if (value === "popular") {
    queryParams.value.sortBy = ["viewsCount"];
    queryParams.value.sortDir = ["desc"];
  } else if (value === "oldest") {
    queryParams.value.sortBy = ["createdAt"];
    queryParams.value.sortDir = ["asc"];
  } else {
    queryParams.value.sortBy = ["createdAt"];
    queryParams.value.sortDir = ["desc"];
  }
};

const prevPage = () => {
  if (projectResponse.value?.pagination.hasPrevPage) {
    queryParams.value.page!--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => {
  if (projectResponse.value?.pagination.hasNextPage) {
    queryParams.value.page!++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
</script>

<template>
  <section class="mt-8 mb-20 md:mt-12">
    <div class="flex flex-col gap-6 mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">Project</h1>
        <p class="max-w-2xl text-lg text-content/80">
          It's more than just lines of code. It's a showcase of my dedication, artistry, and hard
          work in crafting software into a meaningful masterpiece.
        </p>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row shrink-0">
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-content/50 group-focus-within:text-primary"
          >
            <IconSearch class="w-5 h-5" />
          </div>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search projects..."
            class="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-surface/50 border border-border/50 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-content placeholder:text-content/40"
          />
        </div>

        <select
          @change="handleSortChange"
          class="px-4 py-2.5 bg-surface/50 border border-border/50 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-content cursor-pointer appearance-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <AppSkeleton v-if="isLoading" variant="card" :count="8" />

      <AppError v-else-if="isError" title="Failed to load projects" :message="error?.message" />

      <div
        v-else-if="projectResponse?.data.length === 0"
        class="py-16 text-center border border-dashed col-span-full rounded-2xl border-border/50 text-content/60"
      >
        <IconSearch class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p class="text-lg font-medium">No projects found.</p>
        <p class="text-sm">Try adjusting your search keywords.</p>
      </div>

      <ProjectCard
        v-else
        v-for="project in projectResponse?.data"
        :key="project.id"
        :project="project"
      />
    </div>

    <div
      v-if="projectResponse?.pagination && projectResponse.pagination.totalPages > 1"
      class="flex items-center justify-center gap-6 mt-16"
    >
      <AppButton
        variant="secondary"
        size="md"
        :disabled="!projectResponse.pagination.hasPrevPage || isFetching"
        @click="prevPage"
        class="min-w-25"
      >
        &larr; Prev
      </AppButton>

      <span class="text-sm font-medium text-content/70">
        Page {{ projectResponse.pagination.currentPage }} of
        {{ projectResponse.pagination.totalPages }}
      </span>

      <AppButton
        variant="secondary"
        size="md"
        :disabled="!projectResponse.pagination.hasNextPage || isFetching"
        @click="nextPage"
        class="min-w-25"
      >
        Next &rarr;
      </AppButton>
    </div>
  </section>
</template>
