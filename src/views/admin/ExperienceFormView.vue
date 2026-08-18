<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { isAxiosError } from "axios";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconLoader from "~icons/lucide/loader-2";
import IconPlus from "~icons/lucide/plus";
import IconTrash2 from "~icons/lucide/trash-2";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import AppCheckbox from "@/components/shared/AppCheckbox.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import { useExperienceMutation, useExperienceUpdateMutation } from "@/composables/queries/useExperiences";
import { experienceService } from "@/services/experienceService";
import { setAcceptLanguage } from "@/api/axiosClient";
import { useI18nStore } from "@/stores/i18nStores";
import { useZodForm } from "@/composables/useZodForm";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { experienceRequestSchema, type ExperienceRequestInput } from "@/schemas/experience.schema";
import { LanguageCode } from "@/types/api";
import type { ErrorResponse } from "@/types/api";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/ExperienceFormView.json
const t = useT("views.admin.ExperienceFormView");
const toast = useToast();
const route = useRoute();
const router = useRouter();
const i18nStore = useI18nStore();

const experienceId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!experienceId.value);

const emptyExperienceRequest = (): ExperienceRequestInput => ({
  companyName: "",
  startDate: "",
  endDate: null,
  isCurrent: false,
  translations: [
    { locale: LanguageCode.en, position: "", description: "", jobdesks: [] },
    { locale: LanguageCode.id, position: "", description: "", jobdesks: [] },
  ],
});

const { values, errors, handleSubmit, validateField, reset } = useZodForm(
  experienceRequestSchema,
  emptyExperienceRequest(),
);

// * values.translations selalu diisi persis 2 entry - en & id - sejak initial value
// & tiap kali reset() (lihat emptyExperienceRequest() & loadExperienceForEdit()), jadi
// aman non-null assert di sini daripada nangani "possibly undefined" di tiap pemakaian.
function translationFor(locale: LanguageCode) {
  return values.translations.find((translation) => translation.locale === locale)!;
}

// * `description` di schema-nya nullable (`string | null | undefined`), tapi AppTextarea
// modelnya `string` - computed writable ini yang jembatanin null <-> "" di kedua arah.
function descriptionModel(locale: LanguageCode) {
  return computed({
    get: () => translationFor(locale).description ?? "",
    set: (value: string) => {
      translationFor(locale).description = value;
    },
  });
}
const enDescription = descriptionModel(LanguageCode.en);
const idDescription = descriptionModel(LanguageCode.id);

function jobdesksFor(locale: LanguageCode) {
  return translationFor(locale).jobdesks ?? [];
}

function addJobdesk(locale: LanguageCode) {
  const translation = translationFor(locale);
  translation.jobdesks = [...(translation.jobdesks ?? []), ""];
}

function removeJobdesk(locale: LanguageCode, index: number) {
  const translation = translationFor(locale);
  translation.jobdesks = (translation.jobdesks ?? []).filter((_, i) => i !== index);
}

// * `endDate` dikosongin otomatis pas isCurrent dicentang, biar gak nyisain tanggal
// selesai yang gak konsisten sama status "masih bekerja di sini".
function onIsCurrentChange(value: boolean) {
  values.isCurrent = value;
  if (value) values.endDate = null;
}

// * GET /experiences/:id ngebalikin translation yang UDAH DI-RESOLVE ke satu locale
// (ikut header Accept-Language), bukan translations array lengkap - jadi buat ngisi
// form edit yang butuh 2 locale sekaligus (en & id), fetch-nya dipanggil 2x sambil
// nukar header Accept-Language secara manual, lalu dikembaliin ke locale UI semula.
const isLoadingExperience = ref(isEdit.value);
const loadError = ref<Error | null>(null);

async function loadExperienceForEdit(id: string) {
  isLoadingExperience.value = true;
  loadError.value = null;

  try {
    setAcceptLanguage("en");
    const enResponse = await experienceService.getExperience(id);
    setAcceptLanguage("id");
    const idResponse = await experienceService.getExperience(id);
    const experience = enResponse.data;

    reset({
      companyName: experience.companyName,
      startDate: experience.startDate,
      endDate: experience.endDate,
      isCurrent: experience.isCurrent,
      translations: [
        {
          locale: LanguageCode.en,
          position: enResponse.data.position,
          description: enResponse.data.description ?? "",
          jobdesks: enResponse.data.jobdesks ?? [],
        },
        {
          locale: LanguageCode.id,
          position: idResponse.data.position,
          description: idResponse.data.description ?? "",
          jobdesks: idResponse.data.jobdesks ?? [],
        },
      ],
    });
  } catch (error) {
    loadError.value = error as Error;
  } finally {
    setAcceptLanguage(i18nStore.currentLocale);
    isLoadingExperience.value = false;
  }
}

onMounted(() => {
  if (experienceId.value) loadExperienceForEdit(experienceId.value);
});

const createMutation = useExperienceMutation();
const updateMutation = useExperienceUpdateMutation();
const activeMutation = computed(() => (isEdit.value ? updateMutation : createMutation));
const isSaving = computed(() => activeMutation.value.isPending.value);

const errorMessage = computed(() => {
  const mutationError = activeMutation.value.error.value;
  if (!mutationError) return null;

  if (isAxiosError<ErrorResponse>(mutationError)) {
    return mutationError.response?.data?.message ?? mutationError.message;
  }
  return mutationError.message;
});

const onSubmit = handleSubmit(async (data) => {
  try {
    if (isEdit.value && experienceId.value) {
      await updateMutation.mutateAsync({ id: experienceId.value, data });
      toast.success(t("toast.updated"));
    } else {
      await createMutation.mutateAsync(data);
      toast.success(t("toast.created"));
    }
    router.push({ name: "AdminExperiences" });
  } catch {
    // * Pesan error udah ditangani `errorMessage` (dibaca dari activeMutation.error) & ditampilin di AppAlert
  }
});
</script>

<template>
  <div v-motion="fadeUp()">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink
        :to="{ name: 'AdminExperiences' }"
        class="p-2 -ml-2 rounded-lg text-content/60 hover:bg-surface-raised hover:text-primary"
        :aria-label="t('back')"
      >
        <IconArrowLeft class="size-5" />
      </RouterLink>
      <div>
        <h2 class="text-2xl font-bold text-content">{{ isEdit ? t("editTitle") : t("createTitle") }}</h2>
        <p class="mt-1 text-sm text-content/60">
          {{ isEdit ? t("editSubtitle") : t("createSubtitle") }}
        </p>
      </div>
    </div>

    <AppSkeleton v-if="isLoadingExperience" variant="tile" :count="3" />

    <AppError v-else-if="loadError" :title="t('loadErrorTitle')" :message="loadError.message" />

    <form v-else class="space-y-6" novalidate @submit="onSubmit">
      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput
            v-model="values.companyName"
            :label="t('companyNameLabel')"
            required
            :error="errors.companyName"
            @blur="validateField('companyName')"
          />
          <div class="flex items-end pb-2.5">
            <AppCheckbox
              :label="t('isCurrentLabel')"
              :model-value="!!values.isCurrent"
              @update:model-value="onIsCurrentChange"
            />
          </div>
          <AppInput
            v-model="values.startDate"
            type="date"
            :label="t('startDateLabel')"
            required
            :error="errors.startDate"
            @blur="validateField('startDate')"
          />
          <AppInput
            :model-value="values.endDate ?? ''"
            type="date"
            :label="t('endDateLabel')"
            :disabled="!!values.isCurrent"
            :error="errors.endDate"
            @update:model-value="(value) => (values.endDate = (value as string) || null)"
            @blur="validateField('endDate')"
          />
        </div>
      </section>

      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("translations.title") }}</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.en") }}
            </p>
            <AppInput
              v-model="translationFor(LanguageCode.en).position"
              :label="t('positionLabel')"
              required
              @blur="validateField('translations')"
            />
            <AppTextarea
              v-model="enDescription"
              :label="t('descriptionLabel')"
              @blur="validateField('translations')"
            />
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-content/80">{{ t("jobdesks.title") }}</p>
                <AppButton type="button" variant="secondary" size="sm" @click="addJobdesk(LanguageCode.en)">
                  <IconPlus class="mr-1 size-4" />
                  {{ t("jobdesks.add") }}
                </AppButton>
              </div>
              <p v-if="jobdesksFor(LanguageCode.en).length === 0" class="text-sm text-content/50">
                {{ t("jobdesks.empty") }}
              </p>
              <div
                v-for="(_, index) in jobdesksFor(LanguageCode.en)"
                :key="index"
                class="flex items-start gap-2 mb-2"
              >
                <AppInput
                  v-model="jobdesksFor(LanguageCode.en)[index]"
                  :placeholder="t('jobdesks.placeholder')"
                  class="flex-1"
                />
                <button
                  type="button"
                  class="p-2.5 mt-0.5 rounded-lg text-content/50 hover:bg-danger/10 hover:text-danger"
                  :aria-label="t('jobdesks.remove')"
                  @click="removeJobdesk(LanguageCode.en, index)"
                >
                  <IconTrash2 class="size-4" />
                </button>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.id") }}
            </p>
            <AppInput
              v-model="translationFor(LanguageCode.id).position"
              :label="t('positionLabel')"
              required
              @blur="validateField('translations')"
            />
            <AppTextarea
              v-model="idDescription"
              :label="t('descriptionLabel')"
              @blur="validateField('translations')"
            />
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-content/80">{{ t("jobdesks.title") }}</p>
                <AppButton type="button" variant="secondary" size="sm" @click="addJobdesk(LanguageCode.id)">
                  <IconPlus class="mr-1 size-4" />
                  {{ t("jobdesks.add") }}
                </AppButton>
              </div>
              <p v-if="jobdesksFor(LanguageCode.id).length === 0" class="text-sm text-content/50">
                {{ t("jobdesks.empty") }}
              </p>
              <div
                v-for="(_, index) in jobdesksFor(LanguageCode.id)"
                :key="index"
                class="flex items-start gap-2 mb-2"
              >
                <AppInput
                  v-model="jobdesksFor(LanguageCode.id)[index]"
                  :placeholder="t('jobdesks.placeholder')"
                  class="flex-1"
                />
                <button
                  type="button"
                  class="p-2.5 mt-0.5 rounded-lg text-content/50 hover:bg-danger/10 hover:text-danger"
                  :aria-label="t('jobdesks.remove')"
                  @click="removeJobdesk(LanguageCode.id, index)"
                >
                  <IconTrash2 class="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-if="errors.translations" class="text-xs text-danger">{{ errors.translations }}</p>
      </section>

      <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

      <div class="flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push({ name: 'AdminExperiences' })">
          {{ t("cancel") }}
        </AppButton>
        <AppButton type="submit" :disabled="isSaving">
          <IconLoader v-if="isSaving" class="mr-2 size-4 animate-spin" />
          {{ isSaving ? t("saving") : t("save") }}
        </AppButton>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
