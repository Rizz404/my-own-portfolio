import { reactive } from "vue";
import type { AlertVariant } from "@/utils/alertVariants";

export interface Toast {
  id: number;
  variant: AlertVariant;
  title?: string;
  message: string;
  duration: number;
}

interface ToastOptions {
  title?: string;
  duration?: number;
}

const DEFAULT_DURATION = 4000;

// * State-nya sengaja di module scope (bukan dideklarasi di dalam fungsi
// useToast()), biar semua pemanggil - dari komponen mana pun, atau bahkan
// dari luar komponen kayak interceptor axios - berbagi satu antrian toast
// yang sama. AppToastContainer.vue cukup di-mount sekali (di App.vue) buat
// nampilin semuanya.
const toasts = reactive<Toast[]>([]);
let nextId = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function schedule(id: number, duration: number) {
  // * duration <= 0 artinya toast gak auto-dismiss, harus ditutup manual
  // (dismiss() atau tombol close).
  if (duration <= 0) return;
  timers.set(
    id,
    setTimeout(() => dismiss(id), duration),
  );
}

function show(variant: AlertVariant, message: string, options: ToastOptions = {}) {
  const id = nextId++;
  const duration = options.duration ?? DEFAULT_DURATION;
  toasts.push({ id, variant, message, title: options.title, duration });
  schedule(id, duration);
  return id;
}

function dismiss(id: number) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }

  const index = toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) toasts.splice(index, 1);
}

// * Dipanggil pas toast di-hover/focus - jeda auto-dismiss-nya biar user yang
// lagi baca gak keburu ke-tutup sendiri (WCAG 2.2.1: konten yang timeout
// otomatis harus bisa di-pause). resume() lanjutin timer-nya lagi dari awal
// pas mouse/focus keluar.
function pause(id: number) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function resume(id: number) {
  const toast = toasts.find((toast) => toast.id === id);
  if (toast) schedule(id, toast.duration);
}

export function useToast() {
  return {
    toasts,
    success: (message: string, options?: ToastOptions) => show("success", message, options),
    error: (message: string, options?: ToastOptions) => show("danger", message, options),
    warning: (message: string, options?: ToastOptions) => show("warning", message, options),
    info: (message: string, options?: ToastOptions) => show("info", message, options),
    dismiss,
    pause,
    resume,
  };
}
