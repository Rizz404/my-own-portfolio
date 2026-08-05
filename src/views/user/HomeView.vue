<script setup lang="ts">
import { useProjectsQuery } from "@/composables/queries/useProjects";
import { useBlogsQuery } from "@/composables/queries/useBlogs";
import SocialsWidget from "@/components/SocialsWidget.vue";
import { ref } from "vue";
import type { ProjectQueryParams } from "@/types/project";
import type { BlogQueryParams } from "@/types/blog";
import AppSkeleton from "@/components/AppSkeleton.vue";
import AppError from "@/components/AppError.vue";
import AppButton from "@/components/AppButton.vue";
import BlogCard from "@/components/BlogCard.vue";
import ProjectCard from "@/components/ProjectCard.vue";
import IconArrowRight from "~icons/lucide/arrow-right";
import { fadeUp, staggerDelay } from "@/composables/useMotionPresets";

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
            Hello, I'm <strong class="font-bold text-primary">Rizqiansyah Ramadhan</strong>
          </h1>
          <h2 class="mb-6 text-4xl font-extrabold leading-tight md:text-6xl text-primary">
            <strong>Software Developer</strong>
          </h2>
          <p
            class="max-w-2xl mb-8 text-base font-normal leading-relaxed md:text-lg text-content/80"
          >
            An undergraduate Software Engineering student specializing in backend development, with
            experience in building and managing APIs. Proficient with a diverse tech stack including
            Go (Golang), Express, NestJS, Flask, and Laravel. Skilled in various databases and
            familiar with mobile development using Flutter. Eager to learn and contribute to
            impactful projects.
          </p>

          <RouterLink to="/about">
            <AppButton
              variant="secondary"
              size="lg"
              class="transition-shadow rounded-full shadow-sm hover:shadow-md"
            >
              More about me
            </AppButton>
          </RouterLink>
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
        <h2 class="text-2xl font-bold md:text-3xl">Latest Blogs</h2>
        <RouterLink
          to="/blogs"
          class="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group text-primary hover:brightness-110"
        >
          View all
          <IconArrowRight class="transition-transform size-4 group-hover:translate-x-1" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-if="isBlogLoading" variant="card" :count="4" />
        <AppError
          v-else-if="isBlogError"
          title="Failed to load blogs"
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
        <h2 class="text-2xl font-bold md:text-3xl">Selected Projects</h2>
        <RouterLink
          to="/projects"
          class="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group text-primary hover:brightness-110"
        >
          View all
          <IconArrowRight class="transition-transform size-4 group-hover:translate-x-1" />
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-if="isProjectLoading" variant="card" :count="4" />
        <AppError
          v-else-if="isProjectError"
          title="Failed to load projects"
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
