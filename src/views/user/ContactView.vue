<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import SocialsWidget from "@/components/user/SocialsWidget.vue";
import { useToast } from "@/composables/useToast";
import { useT } from "@/composables/useT";
import { useZodForm } from "@/composables/useZodForm";
import { fadeUp, revealUp } from "@/composables/useMotionPresets";
import {
  Copy as IconCopy,
  Check as IconCheck,
  Send as IconSend,
  Loader2 as IconLoader,
} from "@lucide/vue";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/user/ContactView.json
const t = useT("views.user.ContactView");
const toast = useToast();

// * Placeholder sementara selagi email publik belum disiapkan, sama kayak URL "username"
// di SocialsWidget.vue - tinggal ganti pas udah siap dipublish.
const email = "hello@rizqiansyah.dev";

// * Gak ada endpoint backend buat contact message (lihat src/schemas & src/types - gak ada
// yang mirror ini), jadi schema-nya dideklarasi lokal di sini aja, bukan di src/schemas/.
// Pesan error-nya sengaja hardcode English biar konsisten sama schema lain (mis.
// src/schemas/auth.schema.ts) yang juga belum di-i18n-in.
const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Please tell me your name").max(80, "That name's a bit too long"),
  email: z.email("Please enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(10, "A few more words would help - at least 10 characters")
    .max(2000, "That's a lot to say! Please keep it under 2000 characters"),
});

const { values, errors, isSubmitting, handleSubmit, validateField, reset } = useZodForm(
  contactMessageSchema,
  { name: "", email: "", message: "" },
);

// * Gak ada backend buat nampung pesan ini, jadi "submit"-nya cuma nyusun mailto: link dari
// isi form terus dibuka di aplikasi email default browser - tanpa server, tanpa tracking,
// email biasa yang nyampe ke inbox asli. Kalau nanti ada backend/EmailJS, tinggal ganti
// bagian ini aja.
const onSubmit = handleSubmit(async (data) => {
  const subject = `Portfolio message from ${data.name}`;
  const body = `${data.message}\n\n— ${data.name} (${data.email})`;
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  toast.success(t("form.mailClientToast"));
  reset();
});

const copied = ref(false);
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(email);
    copied.value = true;
    toast.success(t("email.copiedToast"));
    window.setTimeout(() => (copied.value = false), 2000);
  } catch {
    toast.error(t("email.copyError"));
  }
};
</script>

<template>
  <div class="mt-8 mb-20 md:mt-12">
    <section v-motion="fadeUp()" class="max-w-2xl">
      <h1 class="mb-4 text-3xl font-extrabold md:text-5xl text-content">{{ t("hero.title") }}</h1>
      <p class="text-lg text-content/80">{{ t("hero.description") }}</p>
    </section>

    <section class="grid grid-cols-1 gap-8 mt-12 lg:grid-cols-3 lg:items-start">
      <!-- * Form - aksen netral (bukan salah satu dari 4 warna Kita), biar fokus tetep di
           input-nya sendiri, bukan di background card -->
      <div
        v-motion="revealUp()"
        class="p-6 border rounded-2xl border-border/50 bg-surface/30 md:p-8 lg:col-span-2"
      >
        <h2 class="mb-2 text-xl font-bold text-content">{{ t("form.title") }}</h2>
        <p class="mb-6 text-sm text-content/70">{{ t("form.description") }}</p>

        <form class="space-y-4" novalidate @submit="onSubmit">
          <AppInput
            id="contact-name"
            v-model="values.name"
            :label="t('form.nameLabel')"
            :placeholder="t('form.namePlaceholder')"
            :error="errors.name"
            required
            @blur="validateField('name')"
          />

          <AppInput
            id="contact-email"
            v-model="values.email"
            type="email"
            autocomplete="email"
            :label="t('form.emailLabel')"
            :placeholder="t('form.emailPlaceholder')"
            :error="errors.email"
            required
            @blur="validateField('email')"
          />

          <AppTextarea
            id="contact-message"
            v-model="values.message"
            :rows="5"
            :label="t('form.messageLabel')"
            :placeholder="t('form.messagePlaceholder')"
            :error="errors.message"
            required
            @blur="validateField('message')"
          />

          <AppButton
            type="submit"
            class="justify-center w-full gap-2 sm:w-auto"
            :disabled="isSubmitting"
          >
            <IconLoader v-if="isSubmitting" class="size-4 animate-spin" />
            <IconSend v-else class="size-4" />
            {{ isSubmitting ? t("form.submitting") : t("form.submit") }}
          </AppButton>
        </form>
      </div>

      <!-- * Sidebar - card email (aksen primary, merah rambut Kita) & status (aksen
           warning, kancing seragam Kita), ngikutin layout sidebar lg:col-span-1 di
           AboutView.vue -->
      <div class="flex flex-col gap-6">
        <div v-motion="revealUp(0.1)" class="p-6 border rounded-2xl border-primary/25 bg-primary/5">
          <h2 class="flex items-center gap-2 mb-2 text-lg font-bold text-content">
            <span class="rounded-full size-2 bg-primary shrink-0" aria-hidden="true"></span>
            {{ t("email.title") }}
          </h2>
          <p class="mb-4 text-sm text-content/70">{{ t("email.description") }}</p>

          <div class="flex flex-wrap items-center gap-3">
            <a
              :href="`mailto:${email}`"
              class="font-mono text-sm font-medium break-all transition-colors text-content hover:text-primary"
            >
              {{ email }}
            </a>
            <button
              type="button"
              @click="copyEmail"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full border border-border/50 bg-surface/50 text-content/70 hover:border-primary/40 hover:text-primary transition-colors shrink-0"
            >
              <component :is="copied ? IconCheck : IconCopy" class="size-3.5" />
              {{ copied ? t("email.copied") : t("email.copy") }}
            </button>
          </div>
        </div>

        <div
          v-motion="revealUp(0.15)"
          class="p-6 border rounded-2xl border-warning/25 bg-warning/5"
        >
          <h2 class="flex items-center gap-2 mb-2 text-lg font-bold text-content">
            <span
              class="rounded-full size-2 bg-warning shrink-0 animate-pulse"
              aria-hidden="true"
            ></span>
            {{ t("availability.title") }}
          </h2>
          <p class="text-sm text-content/70">{{ t("availability.description") }}</p>
        </div>
      </div>
    </section>

    <section v-motion="revealUp()" class="mt-16">
      <h2 class="flex items-center gap-2.5 mb-2 text-2xl font-bold md:text-3xl text-content">
        <span class="rounded-full size-2.5 bg-success shrink-0" aria-hidden="true"></span>
        {{ t("socials.title") }}
      </h2>
      <p class="max-w-xl text-sm text-content/70">{{ t("socials.description") }}</p>
      <SocialsWidget />
    </section>
  </div>
</template>
