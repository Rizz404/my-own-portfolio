<script setup lang="ts">
import AppButton from "@/components/AppButton.vue";
import SocialsWidget from "@/components/SocialsWidget.vue";
import ExperienceTile from "@/components/ExperienceTile.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import AppError from "@/components/AppError.vue";
import { useExperiencesQuery } from "@/composables/queries/useExperiences";
import type { ExperienceQueryParams } from "@/types/experience";
import { ref } from "vue";
import { fadeUp, revealUp, staggerDelay } from "@/composables/useMotionPresets";

const params = ref<ExperienceQueryParams>({ page: 1, size: 10 });
const { data, isLoading, isError, error } = useExperiencesQuery(params);
</script>

<template>
  <div class="mt-8 md:mt-12">
    <section class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
      <div class="space-y-6 text-base font-normal leading-relaxed md:text-lg text-content/80">
        <h1 class="mb-6 text-4xl font-extrabold leading-tight md:text-5xl text-content">
          I build robust APIs and <br class="hidden md:block" />
          <span class="text-primary">scalable systems.</span>
        </h1>

        <p class="font-medium text-content">
          👋 Hey there! I'm Rizqiansyah Ramadhan, a software engineering student specializing in
          backend development.
        </p>

        <p>
          My journey into software development started with a deep curiosity about how things work
          behind the scenes. While others were mesmerized by beautiful interfaces, I found myself
          captivated by databases, server logic, and the intricate dance of APIs that make those
          interfaces come alive. I focus on the details and I'm passionate about crafting software
          products that are robust, secure, and easy to maintain.
        </p>

        <p>
          Over the years, I've had the opportunity to work with a diverse range of technologies. My
          core toolkit revolves around
          <strong class="text-content">Go (Golang), Express, NestJS, Flask, and Laravel</strong>.
          Whether it's designing a normalized database schema, optimizing query performance, or
          building microservices, I love diving into complex architectural challenges.
        </p>

        <p>
          Beyond backend architecture, I'm also familiar with mobile development using Flutter,
          allowing me to understand the complete lifecycle of product development from the server
          down to the client's hands. I'm a huge advocate for open source, continuous learning, and
          collaborating within globally-remote teams that value trust, kindness, and inclusion.
        </p>

        <p>
          Curious about the specific hardware and software tools I use daily? Feel free to check out
          my
          <RouterLink
            to="/uses"
            class="underline transition-colors text-primary hover:text-primary/80"
            >/uses page</RouterLink
          >.
        </p>
      </div>

      <div
        v-motion="fadeUp(0.15)"
        class="grid grid-cols-2 gap-4 mt-8 lg:mt-0 lg:sticky lg:top-24"
      >
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          class="object-cover w-full h-56 transition-transform duration-500 shadow-lg rounded-xl md:h-72 hover:scale-105"
          alt="Working setup"
        />
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          class="object-cover w-full h-56 transition-transform duration-500 shadow-lg rounded-xl md:h-72 hover:scale-105"
          alt="Coding session"
        />
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          class="object-cover w-full h-48 col-span-2 transition-transform duration-500 shadow-lg rounded-xl md:h-64 hover:scale-105"
          alt="Outdoor workspace"
        />
      </div>
    </section>

    <section class="grid grid-cols-1 gap-12 mt-24 mb-20 lg:grid-cols-3">
      <div v-motion="revealUp()" class="lg:col-span-2">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold md:text-3xl text-content">Experience</h2>
          <AppButton size="sm" variant="secondary" class="rounded-full shadow-sm hover:shadow-md">
            Download Resume
          </AppButton>
        </div>

        <AppSkeleton v-if="isLoading" variant="tile" :count="4" />
        <AppError
          v-else-if="isError"
          title="Failed to load experiences"
          :message="error?.message"
        />

        <div class="flex flex-col gap-3" v-else>
          <ExperienceTile
            v-for="(experience, index) in data?.data"
            :key="experience.id"
            v-motion="fadeUp(staggerDelay(index))"
            :experience="experience"
          />
        </div>
      </div>

      <div v-motion="revealUp(0.1)" class="lg:col-span-1">
        <div class="p-6 border border-border/30 rounded-2xl bg-surface/30">
          <h2 class="mb-2 text-xl font-bold text-content">Let's Connect</h2>
          <p class="mb-6 text-sm text-content/70">
            I'm always open to discussing backend architecture, open-source projects, or new
            opportunities.
          </p>

          <SocialsWidget class="flex-col items-start! gap-4! mt-0!" />
        </div>
      </div>
    </section>
  </div>
</template>
