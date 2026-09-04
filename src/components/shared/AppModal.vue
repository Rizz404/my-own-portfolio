<script setup lang="ts">
import { computed, onBeforeUnmount, useId, watch } from "vue";
import { twMerge } from "tailwind-merge";
import { X as IconX } from "@lucide/vue";
import type { AppModalProps } from "@/types/components";
import { fadeIn, scaleIn } from "@/composables/useMotionPresets";
import { lockBodyScroll, unlockBodyScroll } from "@/composables/useScrollLock";

// * Modal generik & reusable - dipake di mana aja butuh overlay konten
// (konfirmasi, form kecil, preview, dll), alih-alih pakai window.confirm()/
// window.alert() bawaan browser yang gak bisa di-styling & blocking thread.
// Murni "shell": judul/body/footer dateng dari slot/props pemanggil - liat
// AppConfirmDialog.vue buat contoh pemakaian imperatifnya (via useConfirm()).
const props = withDefaults(defineProps<AppModalProps>(), {
  title: undefined,
  size: "md",
  persistent: false,
  closeOnBackdrop: true,
  closeLabel: "Close",
  class: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const titleId = useId();

function close() {
  if (props.persistent) return;
  emit("update:modelValue", false);
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) close();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

// * Listener Esc & scroll-lock cuma dipasang pas modal-nya kebuka - biar gak
// numpuk listener kalau ada banyak instance AppModal yang mounted tapi
// ketutup, dan gak ganggu scroll halaman lain. `isLocked` nge-track state
// lock LOKAL instance ini biar gak kepanggil dobel/gak seimbang ke
// lockBodyScroll()/unlockBodyScroll() yang counter-nya global (lihat
// useScrollLock.ts).
let isLocked = false;

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.addEventListener("keydown", handleKeydown);
      lockBodyScroll();
      isLocked = true;
    } else {
      document.removeEventListener("keydown", handleKeydown);
      if (isLocked) {
        unlockBodyScroll();
        isLocked = false;
      }
    }
  },
  { immediate: true },
);

// * Jaga-jaga kalau komponennya di-unmount selagi modal masih kebuka (mis.
// parent-nya ilang duluan sebelum modelValue sempet balik false) - lock-nya
// tetep harus dilepas, kalau enggak body-nya nyangkut gak bisa di-scroll.
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (isLocked) {
    unlockBodyScroll();
    isLocked = false;
  }
});

const sizeClasses: Record<NonNullable<AppModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const panelClasses = computed(() =>
  twMerge(
    "relative w-full p-6 border shadow-xl bg-surface border-border/60 rounded-2xl",
    sizeClasses[props.size],
    props.class,
  ),
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      v-motion="fadeIn()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="handleBackdropClick"
    >
      <div
        v-motion="scaleIn()"
        :class="panelClasses"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
      >
        <button
          v-if="!persistent"
          type="button"
          :aria-label="closeLabel"
          class="absolute p-1.5 rounded-lg top-4 right-4 text-content/50 hover:bg-surface-raised hover:text-content"
          @click="close"
        >
          <IconX class="size-4" />
        </button>

        <header v-if="title || $slots.header" class="pr-8 mb-4">
          <slot name="header">
            <h3 :id="titleId" class="text-lg font-semibold text-content">{{ title }}</h3>
          </slot>
        </header>

        <div class="text-sm text-content/70">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="flex items-center justify-end gap-2 mt-6">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
