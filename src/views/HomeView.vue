<script setup lang="ts">
import { useProjectsQuery } from "@/composables/queries/useProjects";
import { useBlogsQuery } from "@/composables/queries/useBlogs";
import SocialsWidget from "@/components/SocialsWidget.vue";
import { ref } from "vue";
import type { ProjectQueryParams } from "@/types/project";
import type { BlogQueryParams } from "@/types/blog";
import IconCalendar from "~icons/lucide/calendar";
import IconEye from "~icons/lucide/eye";
import AppButton from "@/components/AppButton.vue";
import { formatDate } from "@/utils/dateUtil";

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
  <section class="mt-8 md:mt-12 bg-background/50">
    <div class="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
      <div>
        <h1 class="mb-2 text-lg font-semibold leading-tight md:text-3xl text-content">
          Hello, I'm <strong class="font-bold text-primary">Rizqiansyah Ramadhan</strong>
        </h1>
        <h2 class="mb-6 text-4xl font-extrabold leading-tight md:text-6xl text-primary">
          <strong>Software Developer</strong>
        </h2>
        <p class="max-w-2xl mb-8 text-base font-normal leading-relaxed md:text-lg text-content/80">
          An undergraduate Software Engineering student specializing in backend development, with
          experience in building and managing APIs. Proficient with a diverse tech stack including
          Go (Golang), Express, NestJS, Flask, and Laravel. Skilled in various databases and
          familiar with mobile development using Flutter. Eager to learn and contribute to impactful
          projects.
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
  </section>

  <!-- * Social -->
  <SocialsWidget />

  <!-- * Latest Blog -->
  <section class="mt-20 md:mt-32">
    <div class="flex items-end justify-between mb-6">
      <h2 class="text-2xl font-bold md:text-3xl">Latest Blogs</h2>
      <RouterLink
        to="/blogs"
        class="text-sm font-medium transition-colors text-primary hover:brightness-110"
      >
        View all &rarr;
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <template v-if="isBlogLoading">
        <div
          v-for="i in 4"
          :key="i"
          class="flex gap-4 p-4 transition-all border border-transparent cursor-wait md:flex-col rounded-xl bg-surface/50 animate-pulse"
        >
          <div
            class="rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video bg-surface-raised"
          ></div>
          <div class="w-full space-y-3">
            <div class="w-1/2 h-3 rounded bg-surface-raised"></div>
            <div class="w-3/4 h-5 rounded bg-surface-raised"></div>
            <div class="w-full h-4 rounded bg-surface-raised"></div>
            <div class="w-full h-4 rounded bg-surface-raised"></div>
          </div>
        </div>
      </template>

      <div
        v-else-if="isBlogError"
        class="flex flex-col items-center justify-center col-span-1 py-12 text-center border md:col-span-2 lg:col-span-4 rounded-xl bg-danger/10 border-danger/20"
      >
        <span class="mb-2 text-3xl">⚠️</span>
        <h3 class="font-semibold text-danger">Failed to load blogs</h3>
        <p class="text-sm text-danger/80">
          {{ blogError?.message || "Something went wrong on our end." }}
        </p>
      </div>

      <template v-else>
        <div
          v-for="blog in blogResponse?.data"
          :key="blog.id"
          class="flex gap-4 p-4 transition-all border border-transparent cursor-pointer group md:flex-col rounded-xl hover:border-border/30 hover:bg-surface-raised hover:-translate-y-1"
        >
          <img
            :src="
              blog.featuredImage ||
              'https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg'
            "
            :alt="blog.title"
            class="object-cover rounded-md shrink-0 size-24 md:w-full md:h-auto md:aspect-video"
          />
          <div class="flex flex-col">
            <div
              class="flex items-center gap-3 mb-2 text-xs font-medium md:text-sm text-content/50"
            >
              <span class="flex items-center gap-1"
                ><IconCalendar class="size-3" /> {{ formatDate(blog.createdAt) }}</span
              >
              <span class="flex items-center gap-1"
                ><IconEye class="size-3" /> {{ blog.viewsCount }}</span
              >
            </div>
            <h3
              class="mb-2 text-lg font-semibold transition-colors text-content group-hover:text-primary"
            >
              {{ blog.title }}
            </h3>
            <p
              class="text-base font-normal leading-relaxed md:text-sm text-content/70 line-clamp-3"
            >
              {{ blog.content }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </section>

  <!-- * Selected Project -->
  <section class="mt-20 md:mt-32 mb-20">
    <div class="flex items-end justify-between mb-6">
      <h2 class="text-2xl font-bold md:text-3xl">Selected Projects</h2>
      <RouterLink
        to="/projects"
        class="text-sm font-medium transition-colors text-primary hover:brightness-110"
      >
        View all &rarr;
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <template v-if="isProjectLoading">
        <div
          v-for="i in 4"
          :key="i"
          class="flex gap-4 p-4 transition-all border border-transparent cursor-wait md:flex-col rounded-xl bg-surface/50 animate-pulse"
        >
          <div
            class="shrink-0 size-24 md:w-full md:h-auto md:aspect-video rounded-md bg-surface-raised"
          ></div>
          <div class="w-full space-y-3">
            <div class="w-3/4 h-5 rounded bg-surface-raised"></div>
            <div class="w-full h-4 rounded bg-surface-raised"></div>
            <div class="w-full h-4 rounded bg-surface-raised"></div>
          </div>
        </div>
      </template>

      <div
        v-else-if="isProjectError"
        class="flex flex-col items-center justify-center py-12 text-center col-span-1 md:col-span-2 lg:col-span-4 rounded-xl bg-danger/10 border border-danger/20"
      >
        <span class="mb-2 text-3xl">⚠️</span>
        <h3 class="font-semibold text-danger">Failed to load projects</h3>
        <p class="text-sm text-danger/80">
          {{ projectError?.message || "Cannot fetch projects at the moment." }}
        </p>
      </div>

      <template v-else>
        <div
          v-for="project in projectResponse?.data"
          :key="project.id"
          class="flex gap-4 p-4 transition-all border border-transparent cursor-pointer group md:flex-col rounded-xl hover:border-border/30 hover:bg-surface-raised hover:-translate-y-1"
        >
          <div
            class="relative shrink-0 size-24 md:w-full md:h-auto md:aspect-video rounded-md overflow-hidden"
          >
            <img
              :src="
                project.logoUrl ||
                'https://i.pinimg.com/736x/76/0f/8e/760f8e5ff6cfa1b22ac33a8ae3705dbb.jpg'
              "
              :alt="project.name"
              class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <span
              class="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-md bg-background/80 backdrop-blur-sm border border-border/50"
            >
              {{ project.status || "Completed" }}
            </span>
          </div>
          <div class="flex flex-col mt-1">
            <h3
              class="mb-2 text-lg font-semibold transition-colors text-content group-hover:text-primary"
            >
              {{ project.name }}
            </h3>
            <p
              class="font-normal leading-relaxed text-base md:text-sm text-content/70 line-clamp-3"
            >
              {{ project.description }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
