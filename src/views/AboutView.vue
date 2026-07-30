<script setup lang="ts">
import AppButton from "@/components/AppButton.vue";
import SocialsWidget from "@/components/SocialsWidget.vue";
import { useExperiencesQuery } from "@/composables/queries/useExperiences";
import type { ExperienceQueryParams } from "@/types/experience";
import { ref } from "vue";

const params = ref<ExperienceQueryParams>({ page: 1, size: 4 });
const { data, isLoading, isError, error } = useExperiencesQuery(params);
</script>

<template>
  <section class="">
    <h1 class="font-bold md:text-4xl text-content">About</h1>
    <div class="flex items-center justify-between gap-12 mt-4">
      <div class="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          alt=""
          class="object-cover size-42 rounded-xs ring-primary ring-2"
        />
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          alt=""
          class="object-cover size-42 rounded-xs ring-primary ring-2"
        />
        <img
          src="https://i.pinimg.com/originals/e8/fe/59/e8fe595d3fcec5c93bb57a21dbf67081.gif"
          alt=""
          class="object-cover size-42 rounded-xs ring-primary ring-2"
        />
      </div>
      <div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum a voluptates excepturi
          autem porro nostrum obcaecati corporis amet odit omnis? Accusamus assumenda perspiciatis
          quisquam quia itaque consequuntur natus praesentium nam?
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus suscipit ab eos blanditiis,
          doloremque quas. Alias, quibusdam dolorum dolores cupiditate provident doloribus, enim
          eligendi, vel quia temporibus exercitationem unde quas.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non dicta, magnam voluptatibus
          doloribus deserunt dolorum. Incidunt accusamus quos quidem deleniti modi quis eaque animi,
          veniam iusto saepe illum quo ad.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam ea nisi cupiditate id
          facere illum perferendis vero optio quod explicabo ipsam possimus itaque, aliquam totam
          sint accusamus quo. Optio, perspiciatis?
        </p>
      </div>
    </div>
  </section>

  <SocialsWidget />

  <!-- * Experiences -->
  <section class="mt-8">
    <div class="flex justify-between items-center">
      <h2>Experience</h2>
      <AppButton>Resume</AppButton>
    </div>
    <div class="" v-if="isLoading">Memuat blogs...</div>
    <div class="" v-else-if="isError">Terjadi kesalahan: {{ error?.message }}</div>
    <div class="mt-4 flex flex-col gap-4">
      <div v-for="experience in data?.data" :key="experience.id" class="">
        <h2>{{ experience.companyName }}</h2>
        <p>{{ experience.description }}</p>
        <p></p>
      </div>
    </div>
  </section>
</template>
