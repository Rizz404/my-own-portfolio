<script setup lang="ts">
import { ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import { useBlogsQuery } from "@/composables/queries/useBlogs";
import type { BlogQueryParams } from "@/types/blog";
import BlogCard from "@/components/user/BlogCard.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import AppButton from "@/components/shared/AppButton.vue";
import IconSearch from "~icons/lucide/search";
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/BlogView.json
const t = useT("views.user.BlogView");

const searchInput = ref("");
const debouncedSearch = refDebounced(searchInput, 500);

const queryParams = ref<BlogQueryParams>({
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

const { data: blogResponse, isLoading, isError, isFetching, error } = useBlogsQuery(queryParams);

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
  if (blogResponse.value?.pagination.hasPrevPage) {
    queryParams.value.page!--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => {
  if (blogResponse.value?.pagination.hasNextPage) {
    queryParams.value.page!++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
</script>

<template>
  <section class="mt-8 mb-20 md:mt-12">
    <div class="flex flex-col gap-6 mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">{{ t("title") }}</h1>
        <p class="max-w-2xl text-lg text-content/80">
          {{ t("subtitle") }}
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
            :placeholder="t('searchPlaceholder')"
            class="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-surface/50 border border-border/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all text-content placeholder:text-content/40"
          />
        </div>

        <select
          @change="handleSortChange"
          class="px-4 py-2.5 bg-surface/50 border border-border/50 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all text-content cursor-pointer appearance-none"
        >
          <option value="newest">{{ t("sort.newest") }}</option>
          <option value="oldest">{{ t("sort.oldest") }}</option>
          <option value="popular">{{ t("sort.popular") }}</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <AppSkeleton v-if="isLoading" variant="card" :count="8" />

      <AppError v-else-if="isError" :title="t('errorLoad')" :message="error?.message" />

      <div
        v-else-if="blogResponse?.data.length === 0"
        v-motion="fadeUp()"
        class="py-16 text-center border border-dashed col-span-full rounded-2xl border-border/50 text-content/60"
      >
        <IconSearch class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p class="text-lg font-medium">{{ t("empty.title") }}</p>
        <p class="text-sm">{{ t("empty.subtitle") }}</p>
      </div>

      <BlogCard
        v-else
        v-for="(blog, index) in blogResponse?.data"
        :key="blog.id"
        v-motion="fadeUp(staggerDelay(index))"
        :blog="blog"
      />
    </div>

    <div
      v-if="blogResponse?.pagination && blogResponse.pagination.totalPages > 1"
      class="flex items-center justify-center gap-6 mt-16"
    >
      <AppButton
        variant="secondary"
        size="md"
        :disabled="!blogResponse.pagination.hasPrevPage || isFetching"
        @click="prevPage"
        class="min-w-25"
      >
        &larr; {{ t("pagination.prev") }}
      </AppButton>

      <span class="text-sm font-medium text-content/70">
        {{ t("pagination.page") }} {{ blogResponse.pagination.currentPage }}
        {{ t("pagination.of") }} {{ blogResponse.pagination.totalPages }}
      </span>

      <AppButton
        variant="secondary"
        size="md"
        :disabled="!blogResponse.pagination.hasNextPage || isFetching"
        @click="nextPage"
        class="min-w-25"
      >
        {{ t("pagination.next") }} &rarr;
      </AppButton>
    </div>
  </section>
</template>
