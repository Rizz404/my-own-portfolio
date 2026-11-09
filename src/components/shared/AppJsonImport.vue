<script setup lang="ts">
import { ref, watch } from "vue";
import type { ZodType } from "zod";
import {
  Braces as IconBraces,
  Download as IconDownload,
  FileJson as IconFileJson,
  Upload as IconUpload,
} from "@lucide/vue";
import AppAlert from "@/components/shared/AppAlert.vue";
import AppButton from "@/components/shared/AppButton.vue";
import AppModal from "@/components/shared/AppModal.vue";
import { useT } from "@/composables/useT";

// * Editor JSON buat ngisi form admin: isinya SAMA dengan body request backend (mis.
// ProjectRequest), jadi bisa ditulis/di-upload/diedit di sini, lalu "Apply" cuma ngisi
// form-nya - TIDAK langsung nge-save ke backend. Validasi pakai schema zod yang sama
// dengan form, jadi JSON yang lolos sini pasti lolos validasi form juga.
const props = withDefaults(
  defineProps<{
    schema: ZodType;
    // * Contoh JSON yang valid, dimuat lewat tombol "Template".
    template: unknown;
    // * Isi awal editor tiap modal dibuka (biasanya nilai form saat ini), biar JSON
    // bisa langsung diedit/di-export. Kosong -> pakai `template`.
    current?: unknown;
    fileName?: string;
    disabled?: boolean;
  }>(),
  { current: undefined, fileName: "data", disabled: false },
);

const emit = defineEmits<{ apply: [data: unknown] }>();

const t = useT("components.shared.AppJsonImport");

const isOpen = ref(false);
const text = ref("");
const errors = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

watch(isOpen, (open) => {
  if (!open) return;
  text.value = stringify(props.current ?? props.template);
  errors.value = [];
});

function loadTemplate() {
  text.value = stringify(props.template);
  errors.value = [];
}

// * Balikin hasil parse + validasi; null kalau gagal (pesan error masuk `errors`).
function parseAndValidate(): unknown | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.value);
  } catch (error) {
    errors.value = [t("invalidJson", { message: (error as Error).message })];
    return null;
  }

  const result = props.schema.safeParse(parsed);
  if (!result.success) {
    errors.value = result.error.issues.map((issue) =>
      issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
    );
    return null;
  }

  errors.value = [];
  return result.data;
}

function format() {
  const data = parseAndValidateSyntaxOnly();
  if (data !== undefined) text.value = stringify(data);
}

function parseAndValidateSyntaxOnly(): unknown | undefined {
  try {
    return JSON.parse(text.value);
  } catch (error) {
    errors.value = [t("invalidJson", { message: (error as Error).message })];
    return undefined;
  }
}

function apply() {
  const data = parseAndValidate();
  if (data === null) return;
  emit("apply", data);
  isOpen.value = false;
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  // * Reset biar file yang sama bisa dipilih ulang setelah diedit di luar.
  input.value = "";
  if (!file) return;

  text.value = await file.text();
  errors.value = [];
}

function download() {
  const url = URL.createObjectURL(new Blob([text.value], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${props.fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <AppButton type="button" variant="secondary" size="sm" :disabled="disabled" @click="isOpen = true">
    <IconBraces class="mr-1.5 size-4" />
    {{ t("open") }}
  </AppButton>

  <AppModal v-model="isOpen" :title="t('title')" size="lg" class="max-w-3xl">
    <p class="mb-3 text-xs text-content/60">{{ t("description") }}</p>
    <AppAlert variant="warning" class="mb-3">{{ t("fileNotice") }}</AppAlert>

    <div class="flex flex-wrap gap-2 mb-3">
      <AppButton type="button" variant="secondary" size="sm" @click="fileInput?.click()">
        <IconUpload class="mr-1.5 size-4" />
        {{ t("upload") }}
      </AppButton>
      <AppButton type="button" variant="secondary" size="sm" @click="loadTemplate">
        <IconFileJson class="mr-1.5 size-4" />
        {{ t("template") }}
      </AppButton>
      <AppButton type="button" variant="secondary" size="sm" @click="format">
        <IconBraces class="mr-1.5 size-4" />
        {{ t("format") }}
      </AppButton>
      <AppButton type="button" variant="secondary" size="sm" @click="download">
        <IconDownload class="mr-1.5 size-4" />
        {{ t("download") }}
      </AppButton>
      <input ref="fileInput" type="file" accept=".json,application/json" hidden @change="onFileChange" />
    </div>

    <textarea
      v-model="text"
      spellcheck="false"
      rows="18"
      :aria-label="t('title')"
      class="w-full p-3 font-mono text-xs leading-relaxed border outline-none resize-y rounded-xl border-border bg-background text-content focus:border-primary focus:ring-2 focus:ring-primary/50"
    ></textarea>

    <AppAlert v-if="errors.length" variant="danger" class="mt-3">
      <ul class="space-y-0.5 overflow-auto max-h-32 list-disc list-inside">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </AppAlert>

    <template #footer>
      <AppButton type="button" variant="secondary" @click="isOpen = false">
        {{ t("cancel") }}
      </AppButton>
      <AppButton type="button" @click="apply">{{ t("apply") }}</AppButton>
    </template>
  </AppModal>
</template>
