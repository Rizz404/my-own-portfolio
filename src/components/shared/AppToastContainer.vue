<script setup lang="ts">
import type { AppToastContainerProps } from "@/types/components";
import { twMerge } from "tailwind-merge";
import { computed } from "vue";
import IconX from "~icons/lucide/x";
import { useToast } from "@/composables/useToast";
import { useT } from "@/composables/useT";
import { alertVariantClasses, alertVariantIcons } from "@/utils/alertVariants";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/shared/AppToastContainer.json
const t = useT("views.shared.AppToastContainer");

// * Cukup di-mount sekali (di App.vue) - state toast-nya global lewat
// useToast(), jadi komponen mana pun bisa manggil useToast().success(...)
// dst dan otomatis nongol di sini.
const props = withDefaults(defineProps<AppToastContainerProps>(), {
  position: "top-right",
});

const { toasts, dismiss, pause, resume } = useToast();

const positionClasses: Record<NonNullable<AppToastContainerProps["position"]>, string> = {
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

const containerClasses = computed(() =>
  twMerge(
    "fixed z-50 w-[calc(100%-2rem)] max-w-sm pointer-events-none",
    positionClasses[props.position],
  ),
);

const toastBaseClasses =
  "flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg pointer-events-auto";
</script>

<template>
  <Teleport to="body">
    <div :class="containerClasses">
      <TransitionGroup
        name="toast"
        tag="div"
        class="relative flex flex-col w-full gap-2 pointer-events-none"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :role="toast.variant === 'danger' ? 'alert' : 'status'"
          :aria-live="toast.variant === 'danger' ? 'assertive' : 'polite'"
          :class="[toastBaseClasses, alertVariantClasses[toast.variant]]"
          @mouseenter="pause(toast.id)"
          @mouseleave="resume(toast.id)"
          @focusin="pause(toast.id)"
          @focusout="resume(toast.id)"
        >
          <component :is="alertVariantIcons[toast.variant]" class="shrink-0 size-4 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="font-medium">{{ toast.title }}</p>
            <p>{{ toast.message }}</p>
          </div>
          <button
            type="button"
            :aria-label="t('dismiss')"
            class="transition-opacity shrink-0 opacity-70 hover:opacity-100"
            @click="dismiss(toast.id)"
          >
            <IconX class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.toast-leave-active {
  position: absolute;
  width: 100%;
}
.toast-move {
  transition: transform 0.25s ease;
}
</style>
