<script setup lang="ts">
import { useProjectsQuery } from "@/composables/queries/useProjects";
import { useBlogsQuery } from "@/composables/queries/useBlogs";
import SocialsWidget from "@/components/SocialsWidget.vue";
import { ref } from "vue";
import type { ProjectQueryParams } from "@/types/project";
import type { BlogQueryParams } from "@/types/blog";

const blogQueryParams = ref<BlogQueryParams>({ page: 1, size: 8 });
const {
  data: blogResponse,
  isLoading: isBlogLoading,
  isError: isBlogError,
  error: blogError,
} = useBlogsQuery(blogQueryParams);

const projectQueryParams = ref<ProjectQueryParams>({ page: 1, size: 8 });
const {
  data: projectResponse,
  isLoading: isProjectLoading,
  isError: isProjectError,
  error: projectError,
} = useProjectsQuery(projectQueryParams);
</script>

<template>
  <section class="bg-background/50">
    <div class="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
      <div>
        <h1 class="mb-4 text-lg font-semibold leading-tight md:text-4xl text-content">
          Hello, I'm <strong class="font-bold text-primary">Rizqiansyah Ramadhan</strong>
        </h1>
        <h1 class="mb-4 text-lg font-bold leading-tight md:text-4xl text-primary">
          <strong>Software Developer</strong>
        </h1>
        <p class="text-sm font-medium md:text-lg text-content/80">
          An undergraduate Software Engineering student specializing in backend development, with
          experience in building and managing APIs. Proficient with a diverse tech stack including
          Go (Golang), Express, NestJS, Flask, and Laravel. Skilled in various databases and
          familiar with mobile development using Flutter. Eager to learn and contribute to impactful
          projects.
        </p>
      </div>
      <div class="shrink-0">
        <img
          src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
          alt=""
          class="object-cover size-32 md:size-72 ring-2 ring-primary/20 rounded-xs"
        />
      </div>
    </div>
    <div>
      <RouterLink to="/about">More about me</RouterLink>
    </div>
  </section>

  <!-- * Social -->
  <SocialsWidget />

  <!-- * Latest Blog -->
  <section class="mt-8">
    <div class="flex flex-col">
      <h2>Latest Blogs</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-4">
      <div class="" v-if="isBlogLoading">Memuat blogs...</div>
      <div class="" v-else-if="isBlogError">Terjadi kesalahan: {{ blogError?.message }}</div>
      <div v-for="blog in blogResponse?.data" :key="blog.id" class="flex gap-2">
        <img
          :src="
            blog.featuredImage ||
            'https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg'
          "
          :alt="blog.title"
          class="size-12 rounded-xs bg-cover"
        />
        <div>
          <span>{{ blog.createdAt }}</span> . <span>{{ blog.viewsCount }}</span>
          <h3>{{ blog.title }}</h3>
          <p>{{ blog.content }}</p>
        </div>
      </div>
    </div>
    <span class="text-right block">View all</span>
  </section>

  <!-- * Selected Project -->
  <section class="mt-8">
    <div class="">
      <h2>Selected Projects</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-4">
      <div class="" v-if="isProjectLoading">Memuat projects...</div>
      <div class="" v-else-if="isProjectError">Terjadi kesalahan: {{ projectError?.message }}</div>
      <div v-for="project in projectResponse?.data" :key="project.id" class="flex gap-2">
        <img
          :src="
            project.logoUrl ||
            'https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg'
          "
          :alt="project.name"
          class="size-12 rounded-xs bg-cover"
        />
        <div>
          <h3>{{ project.name }}</h3>
          <p class="">{{ project.description }}</p>
        </div>
      </div>
    </div>
    <span class="text-right block">View all</span>
  </section>
</template>
