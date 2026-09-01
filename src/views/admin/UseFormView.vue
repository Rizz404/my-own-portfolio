<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { isAxiosError } from "axios";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconLoader from "~icons/lucide/loader-2";
import IconPlus from "~icons/lucide/plus";
import IconTrash2 from "~icons/lucide/trash-2";
import IconImage from "~icons/lucide/image";
import IconX from "~icons/lucide/x";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import AppSelect from "@/components/shared/AppSelect.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import { useUseMultipartMutation, useUseUpdateMultipartMutation } from "@/composables/queries/useUses";
import { useService } from "@/services/useService";
import { setAcceptLanguage } from "@/api/axiosClient";
import { useI18nStore } from "@/stores/i18nStores";
import { useZodForm } from "@/composables/useZodForm";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { enumStringKeys } from "@/schemas/shared";
import { useRequestSchema, type UseRequestInput } from "@/schemas/use.schema";
import { Category } from "@/types/use";
import type { UseRequest } from "@/types/use";
import { LanguageCode } from "@/types/api";
import type { ErrorResponse } from "@/types/api";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/UseFormView.json
const t = useT("views.admin.UseFormView");
const toast = useToast();
const route = useRoute();
const router = useRouter();
const i18nStore = useI18nStore();

const useId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!useId.value);

const emptyUseRequest = (): UseRequestInput => ({
  itemName: "",
  category: enumStringKeys(Category)[0],
  logoUrl: null,
  pictures: null,
  links: null,
  deletedPictures: [],
  translations: [
    { locale: LanguageCode.en, reasons: "" },
    { locale: LanguageCode.id, reasons: "" },
  ],
});

const { values, errors, handleSubmit, validateField, reset } = useZodForm(useRequestSchema, emptyUseRequest());

// * values.translations selalu diisi persis 2 entry - en & id - sejak initial value
// & tiap kali reset() (lihat emptyUseRequest() & loadUseForEdit()), jadi aman
// non-null assert di sini daripada nangani "possibly undefined" di tiap pemakaian.
function translationFor(locale: LanguageCode) {
  return values.translations.find((translation) => translation.locale === locale)!;
}

// * `reasons` di schema-nya nullable (`string | null | undefined`), tapi AppTextarea
// modelnya `string` - computed writable ini yang jembatanin null <-> "" di kedua arah.
function reasonsModel(locale: LanguageCode) {
  return computed({
    get: () => translationFor(locale).reasons ?? "",
    set: (value: string) => {
      translationFor(locale).reasons = value;
    },
  });
}
const enReasons = reasonsModel(LanguageCode.en);
const idReasons = reasonsModel(LanguageCode.id);

function formatLabel(key: string) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const categoryOptions = enumStringKeys(Category).map((key) => ({
  label: formatLabel(key),
  value: key,
}));

// * `links` (string[]) diedit sebagai daftar baris URL biar UI-nya gampang, terus
// disatuin balik jadi array pas mau submit lewat syncDynamicFields().
const linkRows = ref<{ url: string }[]>([]);

function addLinkRow() {
  linkRows.value.push({ url: "" });
}

function syncDynamicFields() {
  const links = linkRows.value.map((row) => row.url.trim()).filter(Boolean);
  values.links = links.length ? links : null;
}

// * Logo & pictures dikelola terpisah dari useZodForm - keduanya File mentah (bukan
// bagian dari UseRequest), dan dikirim lewat field terpisah di
// UseMultipartRequest/UpdateUseMultipartRequest (lihat useService.ts).
const logoFile = ref<File | undefined>(undefined);
const logoInputRef = ref<HTMLInputElement | null>(null);
const existingLogoUrl = ref<string | null>(null);

const logoPreview = computed(() => {
  if (logoFile.value) return URL.createObjectURL(logoFile.value);
  return existingLogoUrl.value;
});

function onLogoFileChange(event: Event) {
  logoFile.value = (event.target as HTMLInputElement).files?.[0] ?? undefined;
  // * Backend nolak kalau logoUrl (string lama, keisi lewat loadUseForEdit() pas
  // edit) & logoFile dikirim bareng dalam satu request ("Cannot accept both 'logoUrl'
  // string and 'logoFile'. Choose one") - begitu ada file baru dipilih, logoUrl lama
  // wajib di-null-in biar cuma logoFile yang kekirim.
  if (logoFile.value) values.logoUrl = null;
}

const newPictureFiles = ref<File[]>([]);
const picturesInputRef = ref<HTMLInputElement | null>(null);
const existingPictureUrls = ref<string[]>([]);

const newPicturePreviews = computed(() => newPictureFiles.value.map((file) => URL.createObjectURL(file)));

function onPictureFilesChange(event: Event) {
  const input = event.target as HTMLInputElement;
  newPictureFiles.value = [...newPictureFiles.value, ...Array.from(input.files ?? [])];
  input.value = "";
}

function removeNewPicture(index: number) {
  newPictureFiles.value.splice(index, 1);
}

function removeExistingPicture(url: string) {
  existingPictureUrls.value = existingPictureUrls.value.filter((existing) => existing !== url);
  values.deletedPictures = [...(values.deletedPictures ?? []), url];
}

// * GET /uses/:id ngebalikin translation yang UDAH DI-RESOLVE ke satu locale
// (ikut header Accept-Language), bukan translations array lengkap - jadi buat ngisi
// form edit yang butuh 2 locale sekaligus (en & id), fetch-nya dipanggil 2x sambil
// nukar header Accept-Language secara manual, lalu dikembaliin ke locale UI semula.
const isLoadingUse = ref(isEdit.value);
const loadError = ref<Error | null>(null);

async function loadUseForEdit(id: string) {
  isLoadingUse.value = true;
  loadError.value = null;

  try {
    setAcceptLanguage("en");
    const enResponse = await useService.getUse(id);
    setAcceptLanguage("id");
    const idResponse = await useService.getUse(id);
    const use = enResponse.data;

    reset({
      itemName: use.itemName,
      category: use.category,
      logoUrl: use.logoUrl,
      pictures: use.pictures,
      links: use.links,
      deletedPictures: [],
      translations: [
        { locale: LanguageCode.en, reasons: enResponse.data.reasons ?? "" },
        { locale: LanguageCode.id, reasons: idResponse.data.reasons ?? "" },
      ],
    });

    existingLogoUrl.value = use.logoUrl;
    existingPictureUrls.value = use.pictures ?? [];
    linkRows.value = (use.links ?? []).map((url) => ({ url }));
  } catch (error) {
    loadError.value = error as Error;
  } finally {
    setAcceptLanguage(i18nStore.currentLocale);
    isLoadingUse.value = false;
  }
}

onMounted(() => {
  if (useId.value) loadUseForEdit(useId.value);
});

const createMutation = useUseMultipartMutation();
const updateMutation = useUseUpdateMultipartMutation();
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

const submitForm = handleSubmit(async (data) => {
  const useRequest = data as UseRequest;

  try {
    if (isEdit.value && useId.value) {
      await updateMutation.mutateAsync({
        id: useId.value,
        useRequest,
        logoFile: logoFile.value,
        newPictureFiles: newPictureFiles.value.length ? newPictureFiles.value : undefined,
      });
      toast.success(t("toast.updated"));
    } else {
      await createMutation.mutateAsync({
        useRequest,
        logoFile: logoFile.value,
        pictureFiles: newPictureFiles.value.length ? newPictureFiles.value : undefined,
      });
      toast.success(t("toast.created"));
    }
    router.push({ name: "AdminUses" });
  } catch {
    // * Pesan error udah ditangani `errorMessage` (dibaca dari activeMutation.error) & ditampilin di AppAlert
  }
});

const onSubmit = (event?: Event) => {
  syncDynamicFields();
  return submitForm(event);
};
</script>

<template>
  <div v-motion="fadeUp()">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink
        :to="{ name: 'AdminUses' }"
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

    <AppSkeleton v-if="isLoadingUse" variant="tile" :count="3" />

    <AppError v-else-if="loadError" :title="t('loadErrorTitle')" :message="loadError.message" />

    <form v-else class="space-y-6" novalidate @submit="onSubmit">
      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput
            v-model="values.itemName"
            :label="t('itemNameLabel')"
            required
            :error="errors.itemName"
            @blur="validateField('itemName')"
          />
          <AppSelect
            v-model="values.category"
            :label="t('categoryLabel')"
            :options="categoryOptions"
            required
            :error="errors.category"
            @blur="validateField('category')"
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
            <AppTextarea
              v-model="enReasons"
              :label="t('reasonsLabel')"
              @blur="validateField('translations')"
            />
          </div>
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.id") }}
            </p>
            <AppTextarea
              v-model="idReasons"
              :label="t('reasonsLabel')"
              @blur="validateField('translations')"
            />
          </div>
        </div>
        <p v-if="errors.translations" class="text-xs text-danger">{{ errors.translations }}</p>
      </section>

      <section class="p-5 space-y-4 border rounded-card border-border bg-surface">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-content">{{ t("links.title") }}</h3>
          <AppButton type="button" variant="secondary" size="sm" @click="addLinkRow">
            <IconPlus class="mr-1 size-4" />
            {{ t("links.add") }}
          </AppButton>
        </div>
        <p v-if="linkRows.length === 0" class="text-sm text-content/50">
          {{ t("links.empty") }}
        </p>
        <div v-for="(row, index) in linkRows" :key="index" class="flex items-start gap-3">
          <AppInput v-model="row.url" type="url" :placeholder="t('links.urlPlaceholder')" class="flex-1" />
          <button
            type="button"
            class="p-2.5 mt-0.5 rounded-lg text-content/50 hover:bg-danger/10 hover:text-danger"
            :aria-label="t('links.remove')"
            @click="linkRows.splice(index, 1)"
          >
            <IconTrash2 class="size-4" />
          </button>
        </div>
      </section>

      <section class="p-5 space-y-6 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("media.title") }}</h3>

        <div>
          <p class="block mb-1.5 text-sm font-medium text-content/80">{{ t("logo.label") }}</p>
          <div class="flex items-center gap-4">
            <img
              v-if="logoPreview"
              :src="logoPreview"
              :alt="t('logo.label')"
              class="object-cover border size-16 rounded-xl border-border bg-background"
            />
            <div
              v-else
              class="flex items-center justify-center border border-dashed size-16 rounded-xl border-border text-content/30"
            >
              <IconImage class="size-6" />
            </div>
            <div>
              <input ref="logoInputRef" type="file" accept="image/*" class="hidden" @change="onLogoFileChange" />
              <AppButton type="button" variant="secondary" size="sm" @click="logoInputRef?.click()">
                {{ t("logo.choose") }}
              </AppButton>
              <p class="mt-1 text-xs text-content/50">{{ t("logo.hint") }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="block mb-2 text-sm font-medium text-content/80">{{ t("pictures.label") }}</p>
          <div v-if="existingPictureUrls.length || newPicturePreviews.length" class="flex flex-wrap gap-3 mb-3">
            <div v-for="url in existingPictureUrls" :key="url" class="relative group">
              <img :src="url" :alt="t('pictures.label')" class="object-cover border rounded-lg size-20 border-border bg-background" />
              <button
                type="button"
                class="absolute flex items-center justify-center text-white rounded-full shadow-sm -top-1.5 -right-1.5 bg-danger size-5"
                :aria-label="t('pictures.remove')"
                @click="removeExistingPicture(url)"
              >
                <IconX class="size-3" />
              </button>
            </div>
            <div v-for="(url, index) in newPicturePreviews" :key="`new-${index}`" class="relative group">
              <img :src="url" :alt="t('pictures.label')" class="object-cover border rounded-lg size-20 border-border bg-background" />
              <button
                type="button"
                class="absolute flex items-center justify-center text-white rounded-full shadow-sm -top-1.5 -right-1.5 bg-danger size-5"
                :aria-label="t('pictures.remove')"
                @click="removeNewPicture(index)"
              >
                <IconX class="size-3" />
              </button>
            </div>
          </div>
          <input
            ref="picturesInputRef"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onPictureFilesChange"
          />
          <AppButton type="button" variant="secondary" size="sm" @click="picturesInputRef?.click()">
            <IconPlus class="mr-1 size-4" />
            {{ t("pictures.add") }}
          </AppButton>
        </div>
      </section>

      <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

      <div class="flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push({ name: 'AdminUses' })">
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
