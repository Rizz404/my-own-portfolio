<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { isAxiosError } from "axios";
import { ArrowLeft as IconArrowLeft, Loader2 as IconLoader } from "@lucide/vue";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppPasswordInput from "@/components/shared/AppPasswordInput.vue";
import { ADMIN_ACCESS_DENIED, useLoginMutation } from "@/composables/queries/useAuth";
import { fadeUp } from "@/composables/useMotionPresets";
import { useT } from "@/composables/useT";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useZodForm } from "@/composables/useZodForm";
import { loginRequestSchema } from "@/schemas/auth.schema";
import type { ErrorResponse } from "@/types/api";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/LoginView.json
const t = useT("views.admin.LoginView");
const { withLocale } = useLocalizedPath();

const route = useRoute();
const router = useRouter();
const loginMutation = useLoginMutation();

const { values, errors, handleSubmit, validateField } = useZodForm(loginRequestSchema, {
  email: "",
  password: "",
});

const onSubmit = handleSubmit((data) => {
  loginMutation.mutate(data, {
    onSuccess: () => {
      const redirect = route.query.redirect;
      router.replace(typeof redirect === "string" ? redirect : { name: "AdminDashboard" });
    },
  });
});

// * Backend ngebalikin pesan error yang enak dibaca lewat body JSON-nya
// ({ status, message }), tapi axios default `error.message` cuma nunjukkin status
// code mentah ("Request failed with status code 401") - kurang berguna buat form login.
const errorMessage = computed(() => {
  const error = loginMutation.error.value;
  if (!error) return null;

  if (error.message === ADMIN_ACCESS_DENIED) {
    return t("accessDenied");
  }

  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error.message;
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 py-12 bg-background">
    <RouterLink
      :to="withLocale('/')"
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
          src="/images/logo.png"
          alt="Logo"
          class="object-cover w-12 h-12 mx-auto mb-4 ring-2 ring-primary/20 rounded-xs"
        />
        <h1 class="text-xl font-bold text-content">{{ t("title") }}</h1>
        <p class="mt-1 text-sm text-content/60">{{ t("subtitle") }}</p>
      </div>

      <form class="space-y-4" novalidate @submit="onSubmit">
        <AppInput
          id="email"
          v-model="values.email"
          type="email"
          autocomplete="username"
          :label="t('emailLabel')"
          :placeholder="t('emailPlaceholder')"
          :error="errors.email"
          @blur="validateField('email')"
        />

        <AppPasswordInput
          id="password"
          v-model="values.password"
          :label="t('passwordLabel')"
          :placeholder="t('passwordPlaceholder')"
          :error="errors.password"
          :show-password-label="t('showPassword')"
          :hide-password-label="t('hidePassword')"
          @blur="validateField('password')"
        />

        <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

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
