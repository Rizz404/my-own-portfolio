<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { isAxiosError } from "axios";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconLoader from "~icons/lucide/loader-2";
import IconImage from "~icons/lucide/image";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppInput from "@/components/shared/AppInput.vue";
import AppTextarea from "@/components/shared/AppTextarea.vue";
import AppSelect from "@/components/shared/AppSelect.vue";
import AppSkeleton from "@/components/shared/AppSkeleton.vue";
import AppError from "@/components/shared/AppError.vue";
import { useUserMultipartMutation, useUserUpdateMultipartMutation } from "@/composables/queries/useUsers";
import { userService } from "@/services/userService";
import { setAcceptLanguage } from "@/api/axiosClient";
import { useI18nStore } from "@/stores/i18nStores";
import { useZodForm } from "@/composables/useZodForm";
import { useT } from "@/composables/useT";
import { useToast } from "@/composables/useToast";
import { enumStringKeys } from "@/schemas/shared";
import { userRequestSchema, type UserRequestInput } from "@/schemas/user.schema";
import { AuthProvider, Gender, Role } from "@/types/user";
import type { UserRequest } from "@/types/user";
import { LanguageCode } from "@/types/api";
import type { ErrorResponse } from "@/types/api";
import { fadeUp } from "@/composables/useMotionPresets";

// * Namespace translation buat view ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/admin/UserFormView.json
const t = useT("views.admin.UserFormView");
const toast = useToast();
const route = useRoute();
const router = useRouter();
const i18nStore = useI18nStore();

const userId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!userId.value);

const emptyUserRequest = (): UserRequestInput => ({
  nickname: "",
  fullName: null,
  email: "",
  password: null,
  role: Role.USER,
  provider: AuthProvider.LOCAL,
  profilePictUrl: null,
  placeOfBirth: null,
  dateOfBirth: null,
  gender: null,
  phoneNumber: null,
  address: null,
  translations: [
    { locale: LanguageCode.en, bio: "" },
    { locale: LanguageCode.id, bio: "" },
  ],
});

const { values, errors, handleSubmit, validateField, reset } = useZodForm(
  userRequestSchema,
  emptyUserRequest(),
);

// * values.translations selalu diisi persis 2 entry - en & id - sejak initial value
// & tiap kali reset() (lihat emptyUserRequest() & loadUserForEdit()), jadi aman
// non-null assert di sini daripada nangani "possibly undefined" di tiap pemakaian.
function translationFor(locale: LanguageCode) {
  return values.translations.find((translation) => translation.locale === locale)!;
}

// * `bio` di schema-nya nullable (`string | null | undefined`), tapi AppTextarea
// modelnya `string` - computed writable ini yang jembatanin null <-> "" di kedua arah.
function bioModel(locale: LanguageCode) {
  return computed({
    get: () => translationFor(locale).bio ?? "",
    set: (value: string) => {
      translationFor(locale).bio = value;
    },
  });
}
const enBio = bioModel(LanguageCode.en);
const idBio = bioModel(LanguageCode.id);

// * `password` kosong ("") dianggap "gak diubah" (nullable di schema) - dijembatanin
// biar edit form bisa dibiarin kosong buat tetep pakai password lama.
const passwordModel = computed({
  get: () => values.password ?? "",
  set: (value: string) => {
    values.password = value || null;
  },
});

// * fullName/placeOfBirth/phoneNumber/address nullable di schema (`string | null |
// undefined`), tapi AppInput modelnya `string` - computed writable ini yang
// jembatanin null <-> "" di kedua arah (sama pola kayak `bioModel`/`descriptionModel`).
function nullableStringModel(key: "fullName" | "placeOfBirth" | "phoneNumber" | "address") {
  return computed({
    get: () => values[key] ?? "",
    set: (value: string) => {
      values[key] = value || null;
    },
  });
}
const fullNameModel = nullableStringModel("fullName");
const placeOfBirthModel = nullableStringModel("placeOfBirth");
const phoneNumberModel = nullableStringModel("phoneNumber");
const addressModel = nullableStringModel("address");

function formatLabel(key: string) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const roleOptions = enumStringKeys(Role).map((key) => ({ label: formatLabel(key), value: key }));
const providerOptions = enumStringKeys(AuthProvider).map((key) => ({ label: formatLabel(key), value: key }));
const genderOptions = [
  { label: t("genderUnspecified"), value: "" },
  ...enumStringKeys(Gender).map((key) => ({ label: formatLabel(key), value: key })),
];

// * `role`/`provider` nullable di schema (admin selalu milih salah satu di form ini,
// gak pernah dibiarin kosong), tapi AppSelect modelnya `string | number` - computed
// writable ini yang jembatanin null <-> default value di kedua arah.
const roleModel = computed({
  get: () => values.role ?? Role.USER,
  set: (value: string) => {
    values.role = value as Role;
  },
});
const providerModel = computed({
  get: () => values.provider ?? AuthProvider.LOCAL,
  set: (value: string) => {
    values.provider = value as AuthProvider;
  },
});

// * `gender` nullable di schema - select-nya butuh string kosong buat opsi "unspecified",
// computed ini yang jembatanin null <-> "" di kedua arah.
const genderModel = computed({
  get: () => values.gender ?? "",
  set: (value: string) => {
    values.gender = (value || null) as UserRequestInput["gender"];
  },
});

// * Profile picture dikelola terpisah dari useZodForm - File mentah (bukan bagian
// dari UserRequest), dikirim lewat field terpisah di UserMultipartRequest/
// UpdateUserMultipartRequest (lihat userService.ts).
const profilePictFile = ref<File | undefined>(undefined);
const profilePictInputRef = ref<HTMLInputElement | null>(null);
const existingProfilePict = ref<string | null>(null);

const profilePictPreview = computed(() => {
  if (profilePictFile.value) return URL.createObjectURL(profilePictFile.value);
  return existingProfilePict.value;
});

function onProfilePictChange(event: Event) {
  profilePictFile.value = (event.target as HTMLInputElement).files?.[0] ?? undefined;
}

// * GET /users/:id ngebalikin translation yang UDAH DI-RESOLVE ke satu locale
// (ikut header Accept-Language), bukan translations array lengkap - jadi buat ngisi
// form edit yang butuh 2 locale sekaligus (en & id), fetch-nya dipanggil 2x sambil
// nukar header Accept-Language secara manual, lalu dikembaliin ke locale UI semula.
const isLoadingUser = ref(isEdit.value);
const loadError = ref<Error | null>(null);

async function loadUserForEdit(id: string) {
  isLoadingUser.value = true;
  loadError.value = null;

  try {
    setAcceptLanguage("en");
    const enResponse = await userService.getUser(id);
    setAcceptLanguage("id");
    const idResponse = await userService.getUser(id);
    const user = enResponse.data;

    reset({
      nickname: user.nickname,
      fullName: user.fullName,
      email: user.email,
      password: null,
      role: user.role,
      provider: user.provider,
      profilePictUrl: user.profilePict,
      placeOfBirth: user.placeOfBirth,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      address: user.address,
      translations: [
        { locale: LanguageCode.en, bio: enResponse.data.bio ?? "" },
        { locale: LanguageCode.id, bio: idResponse.data.bio ?? "" },
      ],
    });

    existingProfilePict.value = user.profilePict;
  } catch (error) {
    loadError.value = error as Error;
  } finally {
    setAcceptLanguage(i18nStore.currentLocale);
    isLoadingUser.value = false;
  }
}

onMounted(() => {
  if (userId.value) loadUserForEdit(userId.value);
});

const createMutation = useUserMultipartMutation();
const updateMutation = useUserUpdateMultipartMutation();
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
  const userRequest = data as UserRequest;

  try {
    if (isEdit.value && userId.value) {
      await updateMutation.mutateAsync({ id: userId.value, userRequest, profilePictFile: profilePictFile.value });
      toast.success(t("toast.updated"));
    } else {
      await createMutation.mutateAsync({ userRequest, profilePictFile: profilePictFile.value });
      toast.success(t("toast.created"));
    }
    router.push({ name: "AdminUsers" });
  } catch {
    // * Pesan error udah ditangani `errorMessage` (dibaca dari activeMutation.error) & ditampilin di AppAlert
  }
});
</script>

<template>
  <div v-motion="fadeUp()">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink
        :to="{ name: 'AdminUsers' }"
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

    <AppSkeleton v-if="isLoadingUser" variant="tile" :count="3" />

    <AppError v-else-if="loadError" :title="t('loadErrorTitle')" :message="loadError.message" />

    <form v-else class="space-y-6" novalidate @submit="onSubmit">
      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("account.title") }}</h3>
        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput
            v-model="values.nickname"
            :label="t('nicknameLabel')"
            required
            :error="errors.nickname"
            @blur="validateField('nickname')"
          />
          <AppInput
            v-model="fullNameModel"
            :label="t('fullNameLabel')"
            :error="errors.fullName"
            @blur="validateField('fullName')"
          />
          <AppInput
            v-model="values.email"
            type="email"
            :label="t('emailLabel')"
            required
            :error="errors.email"
            @blur="validateField('email')"
          />
          <AppInput
            v-model="passwordModel"
            type="password"
            :label="t('passwordLabel')"
            :hint="isEdit ? t('passwordEditHint') : undefined"
            :error="errors.password"
            @blur="validateField('password')"
          />
          <AppSelect
            v-model="roleModel"
            :label="t('roleLabel')"
            :options="roleOptions"
            :error="errors.role"
            @blur="validateField('role')"
          />
          <AppSelect
            v-model="providerModel"
            :label="t('providerLabel')"
            :options="providerOptions"
            :error="errors.provider"
            @blur="validateField('provider')"
          />
        </div>
      </section>

      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("profile.title") }}</h3>
        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput v-model="placeOfBirthModel" :label="t('placeOfBirthLabel')" />
          <AppInput
            :model-value="values.dateOfBirth ?? ''"
            type="date"
            :label="t('dateOfBirthLabel')"
            @update:model-value="(value) => (values.dateOfBirth = (value as string) || null)"
          />
          <AppSelect v-model="genderModel" :label="t('genderLabel')" :options="genderOptions" />
          <AppInput v-model="phoneNumberModel" :label="t('phoneNumberLabel')" />
          <AppInput v-model="addressModel" :label="t('addressLabel')" class="sm:col-span-2" />
        </div>
      </section>

      <section class="p-5 space-y-5 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("translations.title") }}</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.en") }}
            </p>
            <AppTextarea v-model="enBio" :label="t('bioLabel')" @blur="validateField('translations')" />
          </div>
          <div class="space-y-4">
            <p class="text-xs font-semibold tracking-wide uppercase text-content/50">
              {{ t("translations.id") }}
            </p>
            <AppTextarea v-model="idBio" :label="t('bioLabel')" @blur="validateField('translations')" />
          </div>
        </div>
        <p v-if="errors.translations" class="text-xs text-danger">{{ errors.translations }}</p>
      </section>

      <section class="p-5 space-y-4 border rounded-card border-border bg-surface">
        <h3 class="font-semibold text-content">{{ t("profilePict.title") }}</h3>
        <div class="flex items-center gap-4">
          <img
            v-if="profilePictPreview"
            :src="profilePictPreview"
            :alt="t('profilePict.title')"
            class="object-cover border rounded-full size-16 border-border bg-background"
          />
          <div
            v-else
            class="flex items-center justify-center border border-dashed rounded-full size-16 border-border text-content/30"
          >
            <IconImage class="size-6" />
          </div>
          <div>
            <input
              ref="profilePictInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onProfilePictChange"
            />
            <AppButton type="button" variant="secondary" size="sm" @click="profilePictInputRef?.click()">
              {{ t("profilePict.choose") }}
            </AppButton>
            <p class="mt-1 text-xs text-content/50">{{ t("profilePict.hint") }}</p>
          </div>
        </div>
      </section>

      <AppAlert v-if="errorMessage" variant="danger">{{ errorMessage }}</AppAlert>

      <div class="flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push({ name: 'AdminUsers' })">
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
