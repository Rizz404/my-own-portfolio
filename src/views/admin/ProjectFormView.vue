<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { isAxiosError } from "axios";
import { ArrowLeft as IconArrowLeft, Loader2 as IconLoader, Plus as IconPlus, Trash2 as IconTrash2, Image as IconImage, X as IconX } from "@lucide/vue";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import AppSelect from "@/components/shared/AppSelect.vue";
import AppCheckbox from "@/components/shared/AppCheckbox.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import {
  useProjectMultipartMutation,
  useProjectUpdateMultipartMutation,
} from "@/composables/queries/useProjects";
import { useTechIconsQuery, searchTechIcons, type TechIconOption } from "@/composables/queries/useTechIcons";
import { projectService } from "@/services/projectService";
import { setAcceptLanguage } from "@/api/axiosClient";
import { useI18nStore } from "@/stores/i18nStores";
import { useZodForm } from "@/composables/useZodForm";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { enumStringKeys } from "@/schemas/shared";
import { projectRequestSchema, type ProjectRequestInput } from "@/schemas/project.schema";
import { LinkType, ProjectStatus, ProjectType } from "@/types/project";
import type { ProjectRequest } from "@/types/project";
import { LanguageCode } from "@/types/api";
import type { ErrorResponse } from "@/types/api";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/ProjectFormView.json
const t = useT("views.admin.ProjectFormView");
const toast = useToast();
const route = useRoute();
const router = useRouter();
const i18nStore = useI18nStore();

const projectId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!projectId.value);

const emptyProjectRequest = (): ProjectRequestInput => ({
  translations: [
    { locale: LanguageCode.en, name: "", description: "" },
    { locale: LanguageCode.id, name: "", description: "" },
  ],
  status: ProjectStatus.development,
  logoUrl: null,
  imageUrls: null,
  techStack: null,
  projectTypes: [],
  projectLinks: null,
  deletedImageUrls: [],
});

const { values, errors, handleSubmit, validateField, reset } = useZodForm(
  projectRequestSchema,
  emptyProjectRequest(),
);

// * values.translations selalu diisi persis 2 entry - en & id - sejak initial value
// & tiap kali reset() (lihat emptyProjectRequest() & loadProjectForEdit()), jadi aman
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

const statusOptions = enumStringKeys(ProjectStatus).map((key) => ({
  label: formatLabel(key),
  value: ProjectStatus[key],
}));

const projectTypeKeys = enumStringKeys(ProjectType);
const linkTypeOptions = enumStringKeys(LinkType).map((key) => ({
  label: formatLabel(key),
  value: LinkType[key],
}));

function isTypeSelected(type: ProjectType) {
  return (values.projectTypes ?? []).includes(type);
}

function toggleProjectType(type: ProjectType) {
  const current = values.projectTypes ?? [];
  values.projectTypes = current.includes(type)
    ? current.filter((selected) => selected !== type)
    : [...current, type];
}

// * projectLinks (Record<LinkType,string>) diedit sebagai daftar baris type/url biar UI-nya
// gampang, terus disatuin balik jadi object pas mau submit lewat syncDynamicFields().
const projectLinkRows = ref<{ type: LinkType; url: string }[]>([]);

function addLinkRow() {
  projectLinkRows.value.push({ type: LinkType.github, url: "" });
}

// * Tech stack CUMA bisa dipilih dari katalog Devicon (lihat composables/queries/useTechIcons.ts) -
// admin gak bisa nulis nama/URL logo sendiri, biar techStack yang tersimpan selalu nunjuk ke
// logo yang beneran ada. Milih satu saran langsung nambahin chip (icon + nama) ke
// techStackSelections; techStack yang udah kepilih otomatis di-exclude dari hasil pencarian
// biar gak bisa ke-pilih dobel.
const { data: techIconsData, isLoading: isTechIconsLoading } = useTechIconsQuery();
const techSearchQuery = ref("");
const isTechDropdownOpen = ref(false);
const techStackSelections = ref<TechIconOption[]>([]);

const techSearchResults = computed(() => {
  const excludeSlugs = new Set(techStackSelections.value.map((tech) => tech.slug));
  return searchTechIcons(techIconsData.value, techSearchQuery.value, excludeSlugs);
});

// * Index suggestion yang lagi di-highlight, buat navigasi keyboard (↑/↓ + Enter) di
// dropdown pencarian tech stack - biar admin gak wajib gerakin mouse tiap milih.
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

function addTechSelection(option: TechIconOption) {
  techStackSelections.value.push(option);
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
function selectActiveTechOption() {
  const option = techSearchResults.value[techActiveIndex.value];
  if (option) addTechSelection(option);
}

function removeTechSelection(index: number) {
  techStackSelections.value.splice(index, 1);
}

function syncDynamicFields() {
  // * Jaga-jaga terakhir sebelum submit - kalau ada logoFile baru, logoUrl lama
  // gak boleh ikut kekirim (lihat penjelasan di onLogoFileChange()).
  if (logoFile.value) values.logoUrl = null;

  values.techStack = techStackSelections.value.length
    ? Object.fromEntries(techStackSelections.value.map((tech) => [tech.label, tech.iconUrl]))
    : null;

  const linkEntries = projectLinkRows.value
    .filter((row) => row.url.trim())
    .map((row) => [row.type, row.url.trim()] as const);
  values.projectLinks = linkEntries.length
    ? (Object.fromEntries(linkEntries) as Record<LinkType, string>)
    : null;
}

// * Logo & images dikelola terpisah dari useZodForm - keduanya File mentah (bukan
// bagian dari ProjectRequest), dan dikirim lewat field terpisah di
// ProjectMultipartRequest/UpdateProjectMultipartRequest (lihat projectService.ts).
const logoFile = ref<File | undefined>(undefined);
const logoInputRef = ref<HTMLInputElement | null>(null);
const existingLogoUrl = ref<string | null>(null);

const logoPreview = computed(() => {
  if (logoFile.value) return URL.createObjectURL(logoFile.value);
  return existingLogoUrl.value;
});

function onLogoFileChange(event: Event) {
  logoFile.value = (event.target as HTMLInputElement).files?.[0] ?? undefined;
  // * Backend nolak kalau logoUrl (string lama, keisi lewat loadProjectForEdit() pas
  // edit) & logoFile dikirim bareng dalam satu request ("Cannot accept both 'logoUrl'
  // string and 'logoFile'. Choose one") - begitu ada file baru dipilih, logoUrl lama
  // wajib di-null-in biar cuma logoFile yang kekirim.
  if (logoFile.value) values.logoUrl = null;
}

const newImageFiles = ref<File[]>([]);
const imagesInputRef = ref<HTMLInputElement | null>(null);
const existingImageUrls = ref<string[]>([]);

const newImagePreviews = computed(() => newImageFiles.value.map((file) => URL.createObjectURL(file)));

function onImageFilesChange(event: Event) {
  const input = event.target as HTMLInputElement;
  newImageFiles.value = [...newImageFiles.value, ...Array.from(input.files ?? [])];
  input.value = "";
}

function removeNewImage(index: number) {
  newImageFiles.value.splice(index, 1);
}

function removeExistingImage(url: string) {
  existingImageUrls.value = existingImageUrls.value.filter((existing) => existing !== url);
  values.deletedImageUrls = [...(values.deletedImageUrls ?? []), url];
}

// * GET /projects/:id ngebalikin translation yang UDAH DI-RESOLVE ke satu locale
// (ikut header Accept-Language), bukan translations array lengkap - jadi buat ngisi
// form edit yang butuh 2 locale sekaligus (en & id), fetch-nya dipanggil 2x sambil
// nukar header Accept-Language secara manual, lalu dikembaliin ke locale UI semula.
const isLoadingProject = ref(isEdit.value);
const loadError = ref<Error | null>(null);

async function loadProjectForEdit(id: string) {
  isLoadingProject.value = true;
  loadError.value = null;

  try {
    setAcceptLanguage("en");
    const enResponse = await projectService.getProject(id);
    setAcceptLanguage("id");
    const idResponse = await projectService.getProject(id);
    const project = enResponse.data;

    reset({
      translations: [
        { locale: LanguageCode.en, name: enResponse.data.name, description: enResponse.data.description ?? "" },
        { locale: LanguageCode.id, name: idResponse.data.name, description: idResponse.data.description ?? "" },
      ],
      status: project.status,
      logoUrl: project.logoUrl,
      imageUrls: project.imageUrls,
      techStack: project.techStack,
      projectTypes: project.projectTypes ?? [],
      projectLinks: project.projectLinks,
      deletedImageUrls: [],
    });

    existingLogoUrl.value = project.logoUrl;
    existingImageUrls.value = project.imageUrls ?? [];
    // * Project lama bisa aja punya techStack yang gak persis match slug Devicon (mis. dari
    // sebelum fitur ini ada) - fallback pakai key-nya sendiri (di-lowercase) sebagai slug
    // semu, cukup buat kebutuhan :key & exclude-dari-pencarian, gak dikirim kemana-mana.
    techStackSelections.value = Object.entries(project.techStack ?? {}).map(([label, iconUrl]) => ({
      slug: label.toLowerCase(),
      label,
      iconUrl,
      altnames: [],
    }));
    projectLinkRows.value = Object.entries(project.projectLinks ?? {}).map(([type, url]) => ({
      type: type as LinkType,
      url,
    }));
  } catch (error) {
    loadError.value = error as Error;
  } finally {
    setAcceptLanguage(i18nStore.currentLocale);
    isLoadingProject.value = false;
  }
}

onMounted(() => {
  if (projectId.value) loadProjectForEdit(projectId.value);
});

const createMutation = useProjectMultipartMutation();
const updateMutation = useProjectUpdateMultipartMutation();
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
  // * `data` ke-infer dari projectRequestSchema, yang pakai `z.partialRecord()` buat
  // projectLinks (Partial<Record<LinkType,string>>) - sedikit lebih longgar dari tipe
  // `ProjectRequest.projectLinks` (Record<LinkType,string>) di src/types/project.ts.
  // Aman di-cast: syncDynamicFields() cuma nulis key yang urlnya keisi.
  const projectRequest = data as ProjectRequest;

  try {
    if (isEdit.value && projectId.value) {
      await updateMutation.mutateAsync({
        id: projectId.value,
        projectRequest,
        logoFile: logoFile.value,
        newImageFiles: newImageFiles.value.length ? newImageFiles.value : undefined,
      });
      toast.success(t("toast.updated"));
    } else {
      await createMutation.mutateAsync({
        projectRequest,
        logoFile: logoFile.value,
        imageFiles: newImageFiles.value.length ? newImageFiles.value : undefined,
      });
      toast.success(t("toast.created"));
    }
    router.push({ name: "AdminProjects" });
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
        :to="{ name: 'AdminProjects' }"
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

    <AppSkeleton v-if="isLoadingProject" variant="tile" :count="3" />

    <AppError v-else-if="loadError" :title="t('loadErrorTitle')" :message="loadError.message" />

    <form v-else class="space-y-6" novalidate @submit="onSubmit">
      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("translations.title") }}</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.en") }}
            </p>
            <AppInput
              v-model="translationFor(LanguageCode.en).name"
              :label="t('nameLabel')"
              required
              @blur="validateField('translations')"
            />
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
            <AppInput
              v-model="translationFor(LanguageCode.id).name"
              :label="t('nameLabel')"
              required
              @blur="validateField('translations')"
            />
            <AppTextarea
              v-model="idDescription"
              :label="t('descriptionLabel')"
              @blur="validateField('translations')"
            />
          </div>
        </div>
        <p v-if="errors.translations" class="text-xs text-danger">{{ errors.translations }}</p>
      </section>

      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("classification.title") }}</h3>
        <AppSelect
          v-model="values.status"
          :label="t('statusLabel')"
          :options="statusOptions"
          required
          :error="errors.status"
          class="max-w-xs"
          @blur="validateField('status')"
        />
        <div>
          <p class="block mb-2 text-sm font-medium text-content/80">{{ t("typesLabel") }}</p>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <AppCheckbox
              v-for="key in projectTypeKeys"
              :key="key"
              :label="formatLabel(key)"
              :model-value="isTypeSelected(ProjectType[key])"
              @update:model-value="toggleProjectType(ProjectType[key])"
            />
          </div>
        </div>
      </section>

      <section class="p-5 space-y-4 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("techStack.title") }}</h3>
        <p class="text-xs text-content/50">{{ t("techStack.searchHint") }}</p>

        <div class="relative max-w-sm">
          <AppInput
            v-model="techSearchQuery"
            :placeholder="t('techStack.searchPlaceholder')"
            autocomplete="off"
            role="combobox"
            :aria-expanded="isTechDropdownOpen"
            @focus="isTechDropdownOpen = true"
            @blur="isTechDropdownOpen = false"
            @keydown.down.prevent="moveTechActiveIndex(1)"
            @keydown.up.prevent="moveTechActiveIndex(-1)"
            @keydown.enter.prevent="selectActiveTechOption"
            @keydown.esc="isTechDropdownOpen = false"
          />
          <div
            v-if="isTechDropdownOpen && (isTechIconsLoading || techSearchQuery.trim())"
            class="absolute z-10 w-full mt-1 overflow-hidden border rounded-xl shadow-lg border-border bg-surface"
          >
            <p v-if="isTechIconsLoading" class="px-3 py-2 text-xs text-content/50">
              {{ t("techStack.searching") }}
            </p>
            <ul v-else-if="techSearchResults.length" role="listbox" class="overflow-auto max-h-56">
              <li v-for="(option, index) in techSearchResults" :key="option.slug" role="option" :aria-selected="index === techActiveIndex">
                <button
                  type="button"
                  class="flex items-center w-full gap-2 px-3 py-2 text-sm text-left"
                  :class="index === techActiveIndex ? 'bg-surface-raised' : 'hover:bg-surface-raised'"
                  @mousedown.prevent="addTechSelection(option)"
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
            <p v-else class="px-3 py-2 text-xs text-content/50">{{ t("techStack.noMatches") }}</p>
          </div>
        </div>

        <p v-if="techStackSelections.length === 0" class="text-sm text-content/50">
          {{ t("techStack.empty") }}
        </p>
        <div v-else class="flex flex-wrap gap-2">
          <span
            v-for="(tech, index) in techStackSelections"
            :key="`${tech.slug}-${index}`"
            class="inline-flex items-center gap-1.5 py-1 pl-1.5 pr-2 text-sm border rounded-full border-border bg-surface-raised text-content"
          >
            <img :src="tech.iconUrl" :alt="tech.label" loading="lazy" class="object-contain rounded-full size-5 shrink-0" />
            {{ tech.label }}
            <button
              type="button"
              class="p-0.5 -mr-1 rounded-full text-content/50 hover:bg-danger/10 hover:text-danger"
              :aria-label="t('techStack.remove')"
              @click="removeTechSelection(index)"
            >
              <IconX class="size-3" />
            </button>
          </span>
        </div>
      </section>

      <section class="p-5 space-y-4 border rounded-card border-border bg-surface">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-content">{{ t("links.title") }}</h3>
          <AppButton type="button" variant="secondary" size="sm" @click="addLinkRow">
            <IconPlus class="mr-1 size-4" />
            {{ t("links.add") }}
          </AppButton>
        </div>
        <p v-if="projectLinkRows.length === 0" class="text-sm text-content/50">
          {{ t("links.empty") }}
        </p>
        <div v-for="(row, index) in projectLinkRows" :key="index" class="flex items-start gap-3">
          <AppSelect v-model="row.type" :options="linkTypeOptions" class="w-44 shrink-0" />
          <AppInput v-model="row.url" type="url" :placeholder="t('links.urlPlaceholder')" class="flex-1" />
          <button
            type="button"
            class="p-2.5 mt-0.5 rounded-lg text-content/50 hover:bg-danger/10 hover:text-danger"
            :aria-label="t('links.remove')"
            @click="projectLinkRows.splice(index, 1)"
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
          <p class="block mb-2 text-sm font-medium text-content/80">{{ t("images.label") }}</p>
          <div v-if="existingImageUrls.length || newImagePreviews.length" class="flex flex-wrap gap-3 mb-3">
            <div v-for="url in existingImageUrls" :key="url" class="relative group">
              <img :src="url" :alt="t('images.label')" class="object-cover border rounded-lg size-20 border-border bg-background" />
              <button
                type="button"
                class="absolute flex items-center justify-center text-white rounded-full shadow-sm -top-1.5 -right-1.5 bg-danger size-5"
                :aria-label="t('images.remove')"
                @click="removeExistingImage(url)"
              >
                <IconX class="size-3" />
              </button>
            </div>
            <div v-for="(url, index) in newImagePreviews" :key="`new-${index}`" class="relative group">
              <img :src="url" :alt="t('images.label')" class="object-cover border rounded-lg size-20 border-border bg-background" />
              <button
                type="button"
                class="absolute flex items-center justify-center text-white rounded-full shadow-sm -top-1.5 -right-1.5 bg-danger size-5"
                :aria-label="t('images.remove')"
                @click="removeNewImage(index)"
              >
                <IconX class="size-3" />
              </button>
            </div>
          </div>
          <input
            ref="imagesInputRef"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onImageFilesChange"
          />
          <AppButton type="button" variant="secondary" size="sm" @click="imagesInputRef?.click()">
            <IconPlus class="mr-1 size-4" />
            {{ t("images.add") }}
          </AppButton>
        </div>
      </section>

      <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

      <div class="flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push({ name: 'AdminProjects' })">
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
