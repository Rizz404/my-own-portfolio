<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { isAxiosError } from "axios";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconEye from "~icons/lucide/eye";
import IconEyeOff from "~icons/lucide/eye-off";
import IconLoader from "~icons/lucide/loader-2";
import AppButton from "@/components/shared/AppButton.vue";
import { useLoginMutation } from "@/composables/queries/useAuth";
import { fadeUp } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";
import type { ErrorResponse } from "@/types/api";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/LoginView.json
const t = useT("views.admin.LoginView");

const route = useRoute();
const router = useRouter();
const loginMutation = useLoginMutation();

const email = ref("");
const password = ref("");
const isPasswordVisible = ref(false);

const handleSubmit = () => {
  loginMutation.mutate(
    { email: email.value, password: password.value },
    {
      onSuccess: () => {
        const redirect = route.query.redirect;
        router.replace(typeof redirect === "string" ? redirect : { name: "AdminDashboard" });
      },
    },
  );
};

// * Backend ngebalikin pesan error yang enak dibaca lewat body JSON-nya
// ({ status, message }), tapi axios default `error.message` cuma nunjukkin status
// code mentah ("Request failed with status code 401") - kurang berguna buat form login.
const errorMessage = computed(() => {
  const error = loginMutation.error.value;
  if (!error) return null;

  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error.message;
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 py-12 bg-background">
    <RouterLink
      to="/"
      class="absolute inline-flex items-center gap-1.5 text-sm font-medium transition-colors top-6 left-4 sm:left-6 text-content/60 hover:text-primary"
    >
      <IconArrowLeft class="w-4 h-4" />
      {{ t("backToSite") }}
    </RouterLink>

    <div
      v-motion="fadeUp()"
      class="w-full max-w-sm p-8 border shadow-sm rounded-card border-border bg-surface"
    >
      <div class="mb-8 text-center">
        <img
          src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
          alt="Logo"
          class="object-cover w-12 h-12 mx-auto mb-4 ring-2 ring-primary/20 rounded-xs"
        />
        <h1 class="text-xl font-bold text-content">{{ t("title") }}</h1>
        <p class="mt-1 text-sm text-content/60">{{ t("subtitle") }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block mb-1.5 text-sm font-medium text-content/80">
            {{ t("emailLabel") }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="username"
            required
            :placeholder="t('emailPlaceholder')"
            class="w-full px-4 py-2.5 bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all text-content placeholder:text-content/40"
          />
        </div>

        <div>
          <label for="password" class="block mb-1.5 text-sm font-medium text-content/80">
            {{ t("passwordLabel") }}
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              autocomplete="current-password"
              required
              :placeholder="t('passwordPlaceholder')"
              class="w-full py-2.5 pl-4 pr-11 bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all text-content placeholder:text-content/40"
            />
            <button
              type="button"
              :aria-label="t(isPasswordVisible ? 'hidePassword' : 'showPassword')"
              class="absolute -translate-y-1/2 right-3 top-1/2 text-content/40 hover:text-content/70"
              @click="isPasswordVisible = !isPasswordVisible"
            >
              <IconEyeOff v-if="isPasswordVisible" class="w-5 h-5" />
              <IconEye v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <p
          v-if="errorMessage"
          class="px-3 py-2 text-sm border rounded-lg text-danger bg-danger/10 border-danger/20"
        >
          {{ errorMessage }}
        </p>

        <AppButton
          type="submit"
          class="justify-center w-full mt-2"
          :disabled="loginMutation.isPending.value"
        >
          <IconLoader v-if="loginMutation.isPending.value" class="w-4 h-4 mr-2 animate-spin" />
          {{ loginMutation.isPending.value ? t("submitting") : t("submit") }}
        </AppButton>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
