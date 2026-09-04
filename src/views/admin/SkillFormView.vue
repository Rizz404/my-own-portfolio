<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { isAxiosError } from "axios";
import { ArrowLeft as IconArrowLeft, Loader2 as IconLoader, Image as IconImage, X as IconX } from "@lucide/vue";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import AppSelect from "@/components/shared/AppSelect.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import { useSkillMultipartMutation, useSkillUpdateMultipartMutation } from "@/composables/queries/useSkills";
import { useTechIconsQuery, searchTechIcons, type TechIconOption } from "@/composables/queries/useTechIcons";
import { skillService } from "@/services/skillService";
import { setAcceptLanguage } from "@/api/axiosClient";
import { useI18nStore } from "@/stores/i18nStores";
import { useZodForm } from "@/composables/useZodForm";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { enumStringKeys } from "@/schemas/shared";
import { skillRequestSchema, type SkillRequestInput } from "@/schemas/skill.schema";
import { SkillCategory } from "@/types/skill";
import type { SkillRequest } from "@/types/skill";
import { LanguageCode } from "@/types/api";
import type { ErrorResponse } from "@/types/api";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/SkillFormView.json
const t = useT("views.admin.SkillFormView");
const toast = useToast();
const route = useRoute();
const router = useRouter();
const i18nStore = useI18nStore();

const skillId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!skillId.value);

const emptySkillRequest = (): SkillRequestInput => ({
  name: "",
  category: enumStringKeys(SkillCategory)[0],
  logoUrl: null,
  translations: [
    { locale: LanguageCode.en, description: "" },
    { locale: LanguageCode.id, description: "" },
  ],
});

const { values, errors, handleSubmit, validateField, reset } = useZodForm(
  skillRequestSchema,
  emptySkillRequest(),
);

// * values.translations selalu diisi persis 2 entry - en & id - sejak initial value
// & tiap kali reset() (lihat emptySkillRequest() & loadSkillForEdit()), jadi aman
// non-null assert di sini daripada nangani "possibly undefined" di tiap pemakaian.
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

function formatLabel(key: string) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const categoryOptions = enumStringKeys(SkillCategory).map((key) => ({
  label: formatLabel(key),
  value: key,
}));

// * Logo dikelola terpisah dari useZodForm - File mentah (bukan bagian dari
// SkillRequest), dikirim lewat field terpisah di SkillMultipartRequest/
// UpdateSkillMultipartRequest (lihat skillService.ts).
const logoFile = ref<File | undefined>(undefined);
const logoInputRef = ref<HTMLInputElement | null>(null);
const existingLogoUrl = ref<string | null>(null);

const logoPreview = computed(() => {
  if (logoFile.value) return URL.createObjectURL(logoFile.value);
  return existingLogoUrl.value;
});

function onLogoFileChange(event: Event) {
  logoFile.value = (event.target as HTMLInputElement).files?.[0] ?? undefined;
  // * Backend nolak kalau logoUrl (string lama, keisi lewat loadSkillForEdit() pas
  // edit) & logoFile dikirim bareng dalam satu request ("Cannot accept both 'logoUrl'
  // string and 'logoFile'. Choose one") - begitu ada file baru dipilih, logoUrl lama
  // wajib di-null-in biar cuma logoFile yang kekirim.
  if (logoFile.value) values.logoUrl = null;
}

// * Alternatif dari upload file manual - logo skill boleh juga dipilih langsung dari
// katalog Devicon (sama kayak techStack di ProjectFormView), yang ngasih URL logo
// tanpa perlu upload apa-apa. Milih satu suggestion nyetel values.logoUrl langsung
// & mbatalin logoFile yang mungkin udah kepilih (lihat selectTechLogo()), biar cuma
// satu sumber logo yang aktif dalam satu waktu.
const { data: techIconsData, isLoading: isTechIconsLoading } = useTechIconsQuery();
const techSearchQuery = ref("");
const isTechDropdownOpen = ref(false);

const techSearchResults = computed(() => searchTechIcons(techIconsData.value, techSearchQuery.value));

// * Index suggestion yang lagi di-highlight, buat navigasi keyboard (↑/↓ + Enter) di
// dropdown pencarian logo - biar admin gak wajib gerakin mouse tiap milih.
// Direset ke 0 tiap query berubah biar highlight-nya selalu balik ke hasil teratas.
const techActiveIndex = ref(0);
watch(techSearchQuery, () => {
  techActiveIndex.value = 0;
});

function moveTechActiveIndex(delta: number) {
  if (!techSearchResults.value.length) return;
  const maxIndex = techSearchResults.value.length - 1;
  techActiveIndex.value = Math.min(maxIndex, Math.max(0, techActiveIndex.value + delta));
}

function selectTechLogo(option: TechIconOption) {
  logoFile.value = undefined;
  if (logoInputRef.value) logoInputRef.value.value = "";
  values.logoUrl = option.iconUrl;
  existingLogoUrl.value = option.iconUrl;
  // * Sengaja gak nutup isTechDropdownOpen di sini - input tetap focused abis milih
  // (lihat @mousedown.prevent di tombol suggestion), jadi @focus gak bakal nembak lagi
  // buat re-open dropdown-nya. Ngosongin query aja udah cukup nutup dropdown (lihat
  // v-if di template: butuh techSearchQuery.trim()), sambil isTechDropdownOpen tetap
  // true biar begitu user ngetik lagi, dropdown langsung muncul lagi tanpa perlu blur+focus dulu.
  techSearchQuery.value = "";
  techActiveIndex.value = 0;
}

// * Dipanggil dari @keydown.enter di search input - milih suggestion yang lagi di-highlight
// (techActiveIndex) biar admin bisa navigasi ↑/↓ lalu Enter tanpa nyentuh mouse sama sekali.
function selectActiveTechLogo() {
  const option = techSearchResults.value[techActiveIndex.value];
  if (option) selectTechLogo(option);
}

function clearLogo() {
  logoFile.value = undefined;
  if (logoInputRef.value) logoInputRef.value.value = "";
  values.logoUrl = null;
  existingLogoUrl.value = null;
}

// * GET /skills/:id ngebalikin translation yang UDAH DI-RESOLVE ke satu locale
// (ikut header Accept-Language), bukan translations array lengkap - jadi buat ngisi
// form edit yang butuh 2 locale sekaligus (en & id), fetch-nya dipanggil 2x sambil
// nukar header Accept-Language secara manual, lalu dikembaliin ke locale UI semula.
const isLoadingSkill = ref(isEdit.value);
const loadError = ref<Error | null>(null);

async function loadSkillForEdit(id: string) {
  isLoadingSkill.value = true;
  loadError.value = null;

  try {
    setAcceptLanguage("en");
    const enResponse = await skillService.getSkill(id);
    setAcceptLanguage("id");
    const idResponse = await skillService.getSkill(id);
    const skill = enResponse.data;

    reset({
      name: skill.name,
      category: skill.category,
      logoUrl: skill.logoUrl,
      translations: [
        { locale: LanguageCode.en, description: enResponse.data.description ?? "" },
        { locale: LanguageCode.id, description: idResponse.data.description ?? "" },
      ],
    });

    existingLogoUrl.value = skill.logoUrl;
  } catch (error) {
    loadError.value = error as Error;
  } finally {
    setAcceptLanguage(i18nStore.currentLocale);
    isLoadingSkill.value = false;
  }
}

onMounted(() => {
  if (skillId.value) loadSkillForEdit(skillId.value);
});

const createMutation = useSkillMultipartMutation();
const updateMutation = useSkillUpdateMultipartMutation();
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
  const skillRequest = data as SkillRequest;

  try {
    if (isEdit.value && skillId.value) {
      await updateMutation.mutateAsync({ id: skillId.value, skillRequest, logoFile: logoFile.value });
      toast.success(t("toast.updated"));
    } else {
      await createMutation.mutateAsync({ skillRequest, logoFile: logoFile.value });
      toast.success(t("toast.created"));
    }
    router.push({ name: "AdminSkills" });
  } catch {
    // * Pesan error udah ditangani `errorMessage` (dibaca dari activeMutation.error) & ditampilin di AppAlert
  }
});
</script>

<template>
  <div v-motion="fadeUp()">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink
        :to="{ name: 'AdminSkills' }"
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

    <AppSkeleton v-if="isLoadingSkill" variant="tile" :count="3" />

    <AppError v-else-if="loadError" :title="t('loadErrorTitle')" :message="loadError.message" />

    <form v-else class="space-y-6" novalidate @submit="onSubmit">
      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput
            v-model="values.name"
            :label="t('nameLabel')"
            required
            :error="errors.name"
            @blur="validateField('name')"
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
              v-model="enDescription"
              :label="t('descriptionLabel')"
              @blur="validateField('translations')"
            />
          </div>
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.id") }}
            </p>
            <AppTextarea
              v-model="idDescription"
              :label="t('descriptionLabel')"
              @blur="validateField('translations')"
            />
          </div>
        </div>
        <p v-if="errors.translations" class="text-xs text-danger">{{ errors.translations }}</p>
      </section>

      <section class="p-5 space-y-4 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("logo.title") }}</h3>
        <div class="flex items-center gap-4">
          <div v-if="logoPreview" class="relative group">
            <img
              :src="logoPreview"
              :alt="t('logo.title')"
              class="object-cover border size-16 rounded-xl border-border bg-background"
            />
            <button
              type="button"
              class="absolute flex items-center justify-center text-white rounded-full shadow-sm -top-1.5 -right-1.5 bg-danger size-5"
              :aria-label="t('logo.remove')"
              @click="clearLogo"
            >
              <IconX class="size-3" />
            </button>
          </div>
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

        <div>
          <p class="text-xs text-content/50">{{ t("logo.searchHint") }}</p>
          <div class="relative max-w-sm mt-1.5">
            <AppInput
              v-model="techSearchQuery"
              :placeholder="t('logo.searchPlaceholder')"
              autocomplete="off"
              role="combobox"
              :aria-expanded="isTechDropdownOpen"
              @focus="isTechDropdownOpen = true"
              @blur="isTechDropdownOpen = false"
              @keydown.down.prevent="moveTechActiveIndex(1)"
              @keydown.up.prevent="moveTechActiveIndex(-1)"
              @keydown.enter.prevent="selectActiveTechLogo"
              @keydown.esc="isTechDropdownOpen = false"
            />
            <div
              v-if="isTechDropdownOpen && (isTechIconsLoading || techSearchQuery.trim())"
              class="absolute z-10 w-full mt-1 overflow-hidden border rounded-xl shadow-lg border-border bg-surface"
            >
              <p v-if="isTechIconsLoading" class="px-3 py-2 text-xs text-content/50">
                {{ t("logo.searching") }}
              </p>
              <ul v-else-if="techSearchResults.length" role="listbox" class="overflow-auto max-h-56">
                <li
                  v-for="(option, index) in techSearchResults"
                  :key="option.slug"
                  role="option"
                  :aria-selected="index === techActiveIndex"
                >
                  <button
                    type="button"
                    class="flex items-center w-full gap-2 px-3 py-2 text-sm text-left"
                    :class="index === techActiveIndex ? 'bg-surface-raised' : 'hover:bg-surface-raised'"
                    @mousedown.prevent="selectTechLogo(option)"
                    @mouseenter="techActiveIndex = index"
                  >
                    <img
                      :src="option.iconUrl"
                      :alt="option.label"
                      loading="lazy"
                      class="object-contain rounded size-5 shrink-0"
                    />
                    {{ option.label }}
                  </button>
                </li>
              </ul>
              <p v-else class="px-3 py-2 text-xs text-content/50">{{ t("logo.noMatches") }}</p>
            </div>
          </div>
        </div>
      </section>

      <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

      <div class="flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push({ name: 'AdminSkills' })">
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
