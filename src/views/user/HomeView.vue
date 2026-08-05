<script setup lang="ts">
import { useProjectsQuery } from "@/composables/queries/useProjects";
import { useBlogsQuery } from "@/composables/queries/useBlogs";
import SocialsWidget from "@/components/user/SocialsWidget.vue";
import { ref } from "vue";
import type { ProjectQueryParams } from "@/types/project";
import type { BlogQueryParams } from "@/types/blog";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import AppButton from "@/components/shared/AppButton.vue";
import BlogCard from "@/components/user/BlogCard.vue";
import ProjectCard from "@/components/user/ProjectCard.vue";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconDownload from "~icons/lucide/download";
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";
import cvUrl from "@/assets/docs/cv-rizqiansyah-ramadhan.pdf?url";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/HomeView.json
const t = useT("views.user.HomeView");

const blogQueryParams = ref<BlogQueryParams>({ page: 1, size: 4 });
const {
  data: blogResponse,
  isLoading: isBlogLoading,
  isError: isBlogError,
  error: blogError,
} = useBlogsQuery(blogQueryParams);

const projectQueryParams = ref<ProjectQueryParams>({ page: 1, size: 4 });
const {
  data: projectResponse,
  isLoading: isProjectLoading,
  isError: isProjectError,
  error: projectError,
} = useProjectsQuery(projectQueryParams);
</script>

<template>
  <!-- * Pake motion jadi harus punya 1 root element aja -->
  <div>
    <section class="p-6 mt-8 rounded-3xl bg-surface/30 md:mt-12 md:p-10">
      <div class="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
        <div>
          <h1 class="mb-2 text-lg font-semibold leading-tight md:text-3xl text-content">
            {{ t("hero.greeting") }}
            <strong class="font-bold text-primary">Rizqiansyah Ramadhan</strong>
          </h1>
          <h2 class="mb-6 text-4xl font-extrabold leading-tight md:text-6xl text-primary">
            <strong>{{ t("hero.role") }}</strong>
          </h2>
          <p
            class="max-w-2xl mb-8 text-base font-normal leading-relaxed md:text-lg text-content/80"
          >
            {{ t("hero.description") }}
          </p>

          <div class="flex flex-wrap items-center gap-3 sm:gap-4">
            <RouterLink to="/about">
              <AppButton
                variant="primary"
                size="lg"
                class="transition-shadow rounded-full shadow-sm hover:shadow-md"
              >
                {{ t("hero.moreButton") }}
              </AppButton>
            </RouterLink>
            <a :href="cvUrl" download target="_blank" rel="noopener">
              <AppButton
                variant="secondary"
                size="lg"
                class="gap-2 transition-shadow rounded-full shadow-sm hover:shadow-md"
              >
                <IconDownload class="size-4" />
                {{ t("hero.downloadCVButton") }}
              </AppButton>
            </a>
          </div>
        </div>
        <div class="relative shrink-0 group">
          <div
            class="absolute inset-0 transition-all rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30"
          ></div>
          <img
            src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
            alt="Rizqiansyah Ramadhan"
            class="relative object-cover rounded-full shadow-xl size-40 md:size-72 ring-4 ring-background"
          />
        </div>
      </div>

      <SocialsWidget />
    </section>

    <!-- * Latest Blog -->
    <section class="mt-20 md:mt-32">
      <div class="flex items-end justify-between mb-6">
        <h2 class="text-2xl font-bold md:text-3xl">{{ t("latestBlogs.title") }}</h2>
        <RouterLink
          to="/blogs"
          class="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group text-primary hover:brightness-110"
        >
          {{ t("latestBlogs.viewAll") }}
          <IconArrowRight class="transition-transform size-4 group-hover:translate-x-1" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-if="isBlogLoading" variant="card" :count="4" />
        <AppError
          v-else-if="isBlogError"
          :title="t('latestBlogs.errorLoad')"
          :message="blogError?.message"
        />
        <BlogCard
          v-else
          v-for="(blog, index) in blogResponse?.data"
          :key="blog.id"
          v-motion="fadeUp(staggerDelay(index))"
          :blog="blog"
        />
      </div>
    </section>

    <!-- * Selected Project -->
    <section class="p-6 mt-20 mb-20 rounded-3xl bg-surface/20 md:mt-32 md:p-10">
      <div class="flex items-end justify-between mb-6">
        <h2 class="text-2xl font-bold md:text-3xl">{{ t("selectedProjects.title") }}</h2>
        <RouterLink
          to="/projects"
          class="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group text-primary hover:brightness-110"
        >
          {{ t("selectedProjects.viewAll") }}
          <IconArrowRight class="transition-transform size-4 group-hover:translate-x-1" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-if="isProjectLoading" variant="card" :count="4" />
        <AppError
          v-else-if="isProjectError"
          :title="t('selectedProjects.errorLoad')"
          :message="projectError?.message"
        />
        <ProjectCard
          v-else
          v-for="(project, index) in projectResponse?.data"
          :key="project.id"
          v-motion="fadeUp(staggerDelay(index))"
          :project="project"
        />
      </div>
    </section>
  </div>
</template>
