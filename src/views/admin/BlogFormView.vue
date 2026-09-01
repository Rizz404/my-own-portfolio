<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { isAxiosError } from "axios";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconLoader from "~icons/lucide/loader-2";
import IconPlus from "~icons/lucide/plus";
import IconImage from "~icons/lucide/image";
import IconPaperclip from "~icons/lucide/paperclip";
import IconX from "~icons/lucide/x";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import AppCheckbox from "@/components/shared/AppCheckbox.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import { useBlogMultipartMutation, useBlogUpdateMultipartMutation } from "@/composables/queries/useBlogs";
import { blogService } from "@/services/blogService";
import { setAcceptLanguage } from "@/api/axiosClient";
import { useI18nStore } from "@/stores/i18nStores";
import { useZodForm } from "@/composables/useZodForm";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { blogRequestSchema, type BlogRequestInput } from "@/schemas/blog.schema";
import type { BlogRequest } from "@/types/blog";
import type BlogAttachment from "@/types/blogAttachment";
import { LanguageCode } from "@/types/api";
import type { ErrorResponse } from "@/types/api";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/BlogFormView.json
const t = useT("views.admin.BlogFormView");
const toast = useToast();
const route = useRoute();
const router = useRouter();
const i18nStore = useI18nStore();

const blogId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!blogId.value);

const emptyBlogRequest = (): BlogRequestInput => ({
  isPublished: false,
  featuredImageUrl: null,
  viewsCount: 0,
  likesCount: 0,
  dislikesCount: 0,
  deletedAttachmentIds: [],
  translations: [
    { locale: LanguageCode.en, title: "", content: "" },
    { locale: LanguageCode.id, title: "", content: "" },
  ],
});

const { values, errors, handleSubmit, validateField, reset } = useZodForm(
  blogRequestSchema,
  emptyBlogRequest(),
);

// * values.translations selalu diisi persis 2 entry - en & id - sejak initial value
// & tiap kali reset() (lihat emptyBlogRequest() & loadBlogForEdit()), jadi aman
// non-null assert di sini daripada nangani "possibly undefined" di tiap pemakaian.
function translationFor(locale: LanguageCode) {
  return values.translations.find((translation) => translation.locale === locale)!;
}

// * `isPublished` di schema-nya nullable (`boolean | null | undefined`), tapi
// AppCheckbox modelnya `boolean` - computed writable ini yang jembatanin null <->
// false di kedua arah.
const isPublishedModel = computed({
  get: () => !!values.isPublished,
  set: (value: boolean) => {
    values.isPublished = value;
  },
});

// * Featured image & attachments dikelola terpisah dari useZodForm - keduanya File
// mentah (bukan bagian dari BlogRequest), dan dikirim lewat field terpisah di
// BlogMultipartRequest/UpdateBlogMultipartRequest (lihat blogService.ts).
const featuredImageFile = ref<File | undefined>(undefined);
const featuredImageInputRef = ref<HTMLInputElement | null>(null);
const existingFeaturedImage = ref<string | null>(null);

const featuredImagePreview = computed(() => {
  if (featuredImageFile.value) return URL.createObjectURL(featuredImageFile.value);
  return existingFeaturedImage.value;
});

function onFeaturedImageChange(event: Event) {
  featuredImageFile.value = (event.target as HTMLInputElement).files?.[0] ?? undefined;
  // * Backend nolak kalau featuredImageUrl (string lama, keisi lewat loadBlogForEdit() pas
  // edit) & featuredImageFile dikirim bareng dalam satu request ("Cannot accept both
  // 'featuredImageUrl' string and 'featuredImageFile'. Choose one") - begitu ada file baru
  // dipilih, featuredImageUrl lama wajib di-null-in biar cuma featuredImageFile yang kekirim.
  if (featuredImageFile.value) values.featuredImageUrl = null;
}

const newAttachmentFiles = ref<File[]>([]);
const attachmentsInputRef = ref<HTMLInputElement | null>(null);
const existingAttachments = ref<BlogAttachment[]>([]);

function onAttachmentFilesChange(event: Event) {
  const input = event.target as HTMLInputElement;
  newAttachmentFiles.value = [...newAttachmentFiles.value, ...Array.from(input.files ?? [])];
  input.value = "";
}

function removeNewAttachment(index: number) {
  newAttachmentFiles.value.splice(index, 1);
}

function removeExistingAttachment(attachment: BlogAttachment) {
  existingAttachments.value = existingAttachments.value.filter((existing) => existing.id !== attachment.id);
  values.deletedAttachmentIds = [...(values.deletedAttachmentIds ?? []), attachment.id];
}

// * GET /blogs/:id ngebalikin translation yang UDAH DI-RESOLVE ke satu locale
// (ikut header Accept-Language), bukan translations array lengkap - jadi buat ngisi
// form edit yang butuh 2 locale sekaligus (en & id), fetch-nya dipanggil 2x sambil
// nukar header Accept-Language secara manual, lalu dikembaliin ke locale UI semula.
const isLoadingBlog = ref(isEdit.value);
const loadError = ref<Error | null>(null);

async function loadBlogForEdit(id: string) {
  isLoadingBlog.value = true;
  loadError.value = null;

  try {
    setAcceptLanguage("en");
    const enResponse = await blogService.getBlog(id);
    setAcceptLanguage("id");
    const idResponse = await blogService.getBlog(id);
    const blog = enResponse.data;

    reset({
      isPublished: blog.isPublished,
      featuredImageUrl: blog.featuredImage,
      viewsCount: blog.viewsCount,
      likesCount: blog.likesCount,
      dislikesCount: blog.dislikesCount,
      deletedAttachmentIds: [],
      translations: [
        { locale: LanguageCode.en, title: enResponse.data.title, content: enResponse.data.content },
        { locale: LanguageCode.id, title: idResponse.data.title, content: idResponse.data.content },
      ],
    });

    existingFeaturedImage.value = blog.featuredImage;
    existingAttachments.value = blog.blogAttachments ?? [];
  } catch (error) {
    loadError.value = error as Error;
  } finally {
    setAcceptLanguage(i18nStore.currentLocale);
    isLoadingBlog.value = false;
  }
}

onMounted(() => {
  if (blogId.value) loadBlogForEdit(blogId.value);
});

const createMutation = useBlogMultipartMutation();
const updateMutation = useBlogUpdateMultipartMutation();
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
  const blogRequest = data as BlogRequest;

  try {
    if (isEdit.value && blogId.value) {
      await updateMutation.mutateAsync({
        id: blogId.value,
        blogRequest,
        featuredImageFile: featuredImageFile.value,
        newAttachments: newAttachmentFiles.value.length ? newAttachmentFiles.value : undefined,
      });
      toast.success(t("toast.updated"));
    } else {
      await createMutation.mutateAsync({
        blogRequest,
        featuredImageFile: featuredImageFile.value,
        attachments: newAttachmentFiles.value.length ? newAttachmentFiles.value : undefined,
      });
      toast.success(t("toast.created"));
    }
    router.push({ name: "AdminBlogs" });
  } catch {
    // * Pesan error udah ditangani `errorMessage` (dibaca dari activeMutation.error) & ditampilin di AppAlert
  }
});
</script>

<template>
  <div v-motion="fadeUp()">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink
        :to="{ name: 'AdminBlogs' }"
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

    <AppSkeleton v-if="isLoadingBlog" variant="tile" :count="3" />

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
              v-model="translationFor(LanguageCode.en).title"
              :label="t('titleLabel')"
              required
              @blur="validateField('translations')"
            />
            <AppTextarea
              v-model="translationFor(LanguageCode.en).content"
              :label="t('contentLabel')"
              required
              :rows="8"
              @blur="validateField('translations')"
            />
          </div>
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.id") }}
            </p>
            <AppInput
              v-model="translationFor(LanguageCode.id).title"
              :label="t('titleLabel')"
              required
              @blur="validateField('translations')"
            />
            <AppTextarea
              v-model="translationFor(LanguageCode.id).content"
              :label="t('contentLabel')"
              required
              :rows="8"
              @blur="validateField('translations')"
            />
          </div>
        </div>
        <p v-if="errors.translations" class="text-xs text-danger">{{ errors.translations }}</p>
      </section>

      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("stats.title") }}</h3>
        <div class="grid gap-5 sm:grid-cols-3">
          <AppInput
            v-model.number="values.viewsCount"
            type="number"
            min="0"
            :label="t('stats.views')"
            :error="errors.viewsCount"
            @blur="validateField('viewsCount')"
          />
          <AppInput
            v-model.number="values.likesCount"
            type="number"
            min="0"
            :label="t('stats.likes')"
            :error="errors.likesCount"
            @blur="validateField('likesCount')"
          />
          <AppInput
            v-model.number="values.dislikesCount"
            type="number"
            min="0"
            :label="t('stats.dislikes')"
            :error="errors.dislikesCount"
            @blur="validateField('dislikesCount')"
          />
        </div>
        <AppCheckbox :label="t('publishedLabel')" v-model="isPublishedModel" />
      </section>

      <section class="p-5 space-y-6 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("media.title") }}</h3>

        <div>
          <p class="block mb-1.5 text-sm font-medium text-content/80">{{ t("featuredImage.label") }}</p>
          <div class="flex items-center gap-4">
            <img
              v-if="featuredImagePreview"
              :src="featuredImagePreview"
              :alt="t('featuredImage.label')"
              class="object-cover border size-16 rounded-xl border-border bg-background"
            />
            <div
              v-else
              class="flex items-center justify-center border border-dashed size-16 rounded-xl border-border text-content/30"
            >
              <IconImage class="size-6" />
            </div>
            <div>
              <input
                ref="featuredImageInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFeaturedImageChange"
              />
              <AppButton type="button" variant="secondary" size="sm" @click="featuredImageInputRef?.click()">
                {{ t("featuredImage.choose") }}
              </AppButton>
              <p class="mt-1 text-xs text-content/50">{{ t("featuredImage.hint") }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="block mb-2 text-sm font-medium text-content/80">{{ t("attachments.label") }}</p>
          <div
            v-if="existingAttachments.length || newAttachmentFiles.length"
            class="mb-3 space-y-2"
          >
            <div
              v-for="attachment in existingAttachments"
              :key="attachment.id"
              class="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg border-border bg-background"
            >
              <IconPaperclip class="size-4 shrink-0 text-content/50" />
              <span class="flex-1 truncate">{{ attachment.fileName }}</span>
              <button
                type="button"
                class="p-1 rounded-full text-content/50 hover:bg-danger/10 hover:text-danger"
                :aria-label="t('attachments.remove')"
                @click="removeExistingAttachment(attachment)"
              >
                <IconX class="size-3.5" />
              </button>
            </div>
            <div
              v-for="(file, index) in newAttachmentFiles"
              :key="`new-${index}`"
              class="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg border-border bg-background"
            >
              <IconPaperclip class="size-4 shrink-0 text-content/50" />
              <span class="flex-1 truncate">{{ file.name }}</span>
              <button
                type="button"
                class="p-1 rounded-full text-content/50 hover:bg-danger/10 hover:text-danger"
                :aria-label="t('attachments.remove')"
                @click="removeNewAttachment(index)"
              >
                <IconX class="size-3.5" />
              </button>
            </div>
          </div>
          <input
            ref="attachmentsInputRef"
            type="file"
            multiple
            class="hidden"
            @change="onAttachmentFilesChange"
          />
          <AppButton type="button" variant="secondary" size="sm" @click="attachmentsInputRef?.click()">
            <IconPlus class="mr-1 size-4" />
            {{ t("attachments.add") }}
          </AppButton>
        </div>
      </section>

      <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

      <div class="flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push({ name: 'AdminBlogs' })">
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
