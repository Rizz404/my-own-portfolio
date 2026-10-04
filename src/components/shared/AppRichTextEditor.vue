<script setup lang="ts">
import type { AppRichTextEditorProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed, onBeforeUnmount, useId, watch } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold as IconBold,
  Code as IconCode,
  Heading2 as IconHeading2,
  Heading3 as IconHeading3,
  Italic as IconItalic,
  Link as IconLink,
  Unlink as IconUnlink,
  List as IconList,
  ListOrdered as IconListOrdered,
  Quote as IconQuote,
  Redo2 as IconRedo,
  Strikethrough as IconStrikethrough,
  Undo2 as IconUndo,
} from "@lucide/vue";
import { useT } from "@/composables/useT";
import { looksLikeHtml, sanitizeHtml, toDisplayHtml } from "@/utils/richText";

const props = withDefaults(defineProps<AppRichTextEditorProps>(), {
  id: undefined,
  label: undefined,
  placeholder: undefined,
  error: undefined,
  hint: undefined,
  disabled: false,
  required: false,
  class: "",
});

const emit = defineEmits<{ blur: [] }>();

// * Nilai yang disimpan = HTML dari editor ("" kalau kosong). Description lama (plain text)
// tetap kebaca karena dibungkus toDisplayHtml() pas dimasukin ke editor.
const model = defineModel<string>({ default: "" });

const t = useT("components.shared.AppRichTextEditor");

const generatedId = useId();
const labelId = computed(() => `${props.id ?? generatedId}-label`);
const errorId = computed(() => `${props.id ?? generatedId}-error`);

// * Terakhir kali nilai yang kita emit sendiri ke model - dipakai watch di bawah buat bedain
// perubahan dari ketikan user (jangan setContent lagi, kursor bakal loncat) vs perubahan dari
// luar (mis. reset() pas mode edit baru selesai fetch).
let lastEmitted = model.value;

const editor = useEditor({
  content: toDisplayHtml(model.value),
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: { openOnClick: false, autolink: true },
    }),
    Placeholder.configure({ placeholder: props.placeholder ?? "" }),
  ],
  editorProps: {
    attributes: {
      class: "rich-content min-h-40 px-4 py-2.5 outline-none",
      role: "textbox",
      "aria-multiline": "true",
      "aria-labelledby": labelId.value,
    },
    // * Paste dari halaman web / Word (clipboard text/html) udah diparse Tiptap sendiri. Yang
    // ditangani di sini: teks plain yang isinya source HTML (mis. "<p>..</p>" dari file/editor
    // kode) - tanpa ini bakal masuk sebagai teks literal. Disanitasi dulu & di-skip kalau kursor
    // lagi di code/code block, karena di sana user memang mau paste source apa adanya.
    handlePaste: (_view, event) => {
      const instance = editor.value;
      const text = event.clipboardData?.getData("text/plain") ?? "";
      if (!instance || !looksLikeHtml(text)) return false;
      if (instance.isActive("code") || instance.isActive("codeBlock")) return false;

      event.preventDefault();
      instance.commands.insertContent(sanitizeHtml(text));
      return true;
    },
  },
  onUpdate: ({ editor }) => {
    const html = editor.isEmpty ? "" : editor.getHTML();
    lastEmitted = html;
    model.value = html;
  },
  onBlur: () => emit("blur"),
});

watch(model, (value) => {
  if (!editor.value || value === lastEmitted) return;
  lastEmitted = value;
  editor.value.commands.setContent(toDisplayHtml(value), { emitUpdate: false });
});

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
);

onBeforeUnmount(() => editor.value?.destroy());

function toggleLink() {
  const instance = editor.value;
  if (!instance) return;

  if (instance.isActive("link")) {
    instance.chain().focus().unsetLink().run();
    return;
  }

  const previousUrl = instance.getAttributes("link").href as string | undefined;
  const url = window.prompt(t("linkPrompt"), previousUrl ?? "https://")?.trim();
  if (!url) return;
  instance.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

const toolbarButtons = computed(() => {
  const instance = editor.value;
  return [
    {
      key: "bold",
      icon: IconBold,
      active: instance?.isActive("bold"),
      run: () => instance?.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      icon: IconItalic,
      active: instance?.isActive("italic"),
      run: () => instance?.chain().focus().toggleItalic().run(),
    },
    {
      key: "strike",
      icon: IconStrikethrough,
      active: instance?.isActive("strike"),
      run: () => instance?.chain().focus().toggleStrike().run(),
    },
    {
      key: "heading2",
      icon: IconHeading2,
      active: instance?.isActive("heading", { level: 2 }),
      run: () => instance?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      key: "heading3",
      icon: IconHeading3,
      active: instance?.isActive("heading", { level: 3 }),
      run: () => instance?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      key: "bulletList",
      icon: IconList,
      active: instance?.isActive("bulletList"),
      run: () => instance?.chain().focus().toggleBulletList().run(),
    },
    {
      key: "orderedList",
      icon: IconListOrdered,
      active: instance?.isActive("orderedList"),
      run: () => instance?.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "blockquote",
      icon: IconQuote,
      active: instance?.isActive("blockquote"),
      run: () => instance?.chain().focus().toggleBlockquote().run(),
    },
    {
      key: "code",
      icon: IconCode,
      active: instance?.isActive("code"),
      run: () => instance?.chain().focus().toggleCode().run(),
    },
    {
      key: instance?.isActive("link") ? "unlink" : "link",
      icon: instance?.isActive("link") ? IconUnlink : IconLink,
      active: instance?.isActive("link"),
      run: toggleLink,
    },
    {
      key: "undo",
      icon: IconUndo,
      active: false,
      disabled: !instance?.can().undo(),
      run: () => instance?.chain().focus().undo().run(),
    },
    {
      key: "redo",
      icon: IconRedo,
      active: false,
      disabled: !instance?.can().redo(),
      run: () => instance?.chain().focus().redo().run(),
    },
  ];
});

const wrapperClasses = computed(() =>
  twMerge(
    "overflow-hidden transition-all border rounded-xl bg-background text-content focus-within:ring-2 focus-within:ring-primary/50",
    props.error ? "border-danger" : "border-border focus-within:border-primary",
    props.disabled && "opacity-50 grayscale cursor-not-allowed",
    props.class,
  ),
);
</script>

<template>
  <div>
    <p v-if="label" :id="labelId" class="block mb-1.5 text-sm font-medium text-content/80">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </p>

    <div :class="wrapperClasses">
      <div
        role="toolbar"
        :aria-label="t('toolbar.label')"
        class="flex flex-wrap gap-0.5 p-1.5 border-b border-border/50 bg-surface"
      >
        <button
          v-for="button in toolbarButtons"
          :key="button.key"
          type="button"
          :title="t(`toolbar.${button.key}`)"
          :aria-label="t(`toolbar.${button.key}`)"
          :aria-pressed="button.active"
          :disabled="disabled || button.disabled"
          class="p-1.5 transition-colors rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          :class="button.active ? 'bg-primary/10 text-primary' : 'text-content/70 hover:bg-surface-raised hover:text-content'"
          @mousedown.prevent
          @click="button.run"
        >
          <component :is="button.icon" class="size-4" />
        </button>
      </div>

      <EditorContent :editor="editor" />
    </div>

    <p v-if="error" :id="errorId" class="mt-1 text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-content/60">{{ hint }}</p>
  </div>
</template>

<style scoped>
/* Placeholder (extension-placeholder nulis data-placeholder di paragraf kosong pertama) */
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: color-mix(in oklab, var(--color-content) 40%, transparent);
}
</style>
