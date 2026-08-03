<script setup lang="ts">
import { computed } from "vue";
import { useUsesQuery } from "@/composables/queries/useUses";
import AppSkeleton from "@/components/AppSkeleton.vue";
import AppError from "@/components/AppError.vue";
import UseCard from "@/components/UseCard.vue";
import UseTile from "@/components/UseTile.vue";

const { data: response, isLoading, isError, error } = useUsesQuery({ size: 100 });

const hardwareList = computed(() => {
  if (!response.value?.data) return [];
  return response.value.data.filter((item) => String(item.category).toLowerCase() === "hardware");
});

const softwareList = computed(() => {
  if (!response.value?.data) return [];
  return response.value.data.filter((item) => String(item.category).toLowerCase() === "software");
});
</script>

<template>
  <section class="mt-8 mb-20 md:mt-12">
    <div class="mb-12">
      <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">Uses</h1>
      <p class="max-w-2xl mb-8 text-lg text-content/80">
        A curated list of the tech stack, gadgets, and software I use every day to build code and
        stay productive.
      </p>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <AppSkeleton variant="card" :count="4" />
    </div>

    <AppError v-else-if="isError" title="Failed to load gear" :message="error?.message" />

    <div v-else class="space-y-20">
      <div v-if="hardwareList.length > 0">
        <h2 class="mb-6 text-2xl font-bold text-content">Hardware</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UseCard v-for="item in hardwareList" :key="item.id" :item="item" />
        </div>
      </div>

      <div v-if="softwareList.length > 0">
        <h2 class="mb-6 text-2xl font-bold text-content">Software</h2>
        <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <UseTile v-for="item in softwareList" :key="item.id" :item="item" />
        </div>
      </div>
    </div>
  </section>
</template>
