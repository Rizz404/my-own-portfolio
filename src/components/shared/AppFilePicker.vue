<script setup lang="ts">
import { ref, useId } from "vue";
import AppButton from "@/components/shared/AppButton.vue";
import { useT } from "@/composables/useT";
import { acceptsFile } from "@/utils/filePicker";

const props = withDefaults(
  defineProps<{
    label: string;
    accept?: string;
    multiple?: boolean;
    hint?: string;
    disabled?: boolean;
  }>(),
  { accept: "", multiple: false, hint: "", disabled: false },
);
const emit = defineEmits<{ select: [files: File[]] }>();
const t = useT("components.shared.AppFilePicker");
const inputRef = ref<HTMLInputElement | null>(null);
const dragDepth = ref(0);
const error = ref("");
const id = useId();

function selectFiles(files: File[]) {
  if (props.disabled || !files.length) return;
  const accepted = files.filter((file) => acceptsFile(file, props.accept));
  error.value = accepted.length < files.length ? t("invalidType", { accept: props.accept }) : "";
  if (accepted.length) emit("select", props.multiple ? accepted : accepted.slice(0, 1));
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  selectFiles(Array.from(input.files ?? []));
  // Allow picking the same file again after it has been removed by the parent.
  input.value = "";
}

function isFileDrag(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function onDragEnter(event: DragEvent) {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  if (!props.disabled) dragDepth.value++;
}

function onDragOver(event: DragEvent) {
  if (!isFileDrag(event)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = props.disabled ? "none" : "copy";
}

function onDragLeave(event: DragEvent) {
  if (!isFileDrag(event)) return;
  dragDepth.value = Math.max(0, dragDepth.value - 1);
}

function onDrop(event: DragEvent) {
  dragDepth.value = 0;
  if (!isFileDrag(event)) return;
  event.preventDefault();
  event.stopPropagation();
  selectFiles(Array.from(event.dataTransfer?.files ?? []));
}

function onPaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []);
  if (props.disabled || !files.length) return;
  event.preventDefault();
  event.stopPropagation();
  selectFiles(files);
}
</script>

<template>
  <div
    role="group"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-disabled="disabled"
    :aria-describedby="`${id}-hint${error ? ` ${id}-error` : ''}`"
    class="p-3 transition-colors border border-dashed rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    :class="[
      dragDepth && !disabled ? 'border-primary bg-primary/10' : 'border-border',
      disabled ? 'opacity-50' : '',
    ]"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @paste="onPaste"
    @keydown.enter.self.prevent="!disabled && inputRef?.click()"
    @keydown.space.self.prevent="!disabled && inputRef?.click()"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="hidden"
      @change="onChange"
    />
    <div class="flex flex-wrap items-center gap-4">
      <slot />
      <div>
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="disabled"
          @click="inputRef?.click()"
        >
          {{ label }}
        </AppButton>
        <p v-if="hint" class="mt-1 text-xs text-content/50">{{ hint }}</p>
      </div>
    </div>
    <p :id="`${id}-hint`" class="mt-2 text-xs text-content/60">{{ t("instructions") }}</p>
    <p v-if="error" :id="`${id}-error`" role="alert" class="mt-1 text-xs text-danger">
      {{ error }}
    </p>
  </div>
</template>
