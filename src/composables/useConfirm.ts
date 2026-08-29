import { reactive } from "vue";

export interface ConfirmOptions {
  title?: string;
  message: string;
  // * Opsional - kalau gak di-pass, AppConfirmDialog.vue yang isi default
  // ter-translate ("Confirm"/"Cancel") lewat useT()-nya sendiri. Composable
  // ini sengaja gak nge-hardcode teks default biar gak lepas dari i18n.
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
}

interface ConfirmState {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant: "primary" | "danger";
}

// * State & resolver-nya sengaja di module scope (pola sama kayak
// useToast.ts) biar komponen/view mana pun bisa manggil confirm() dan
// otomatis nongol di AppConfirmDialog.vue - yang cukup di-mount sekali di
// App.vue. Ini pengganti window.confirm() bawaan browser: gak nge-block
// thread, bisa di-styling, dan hasilnya tetep di-await kayak biasa lewat
// Promise<boolean>.
const state = reactive<ConfirmState>({
  open: false,
  title: undefined,
  message: "",
  confirmLabel: undefined,
  cancelLabel: undefined,
  variant: "primary",
});

let resolvePromise: ((value: boolean) => void) | null = null;

function confirm(options: ConfirmOptions): Promise<boolean> {
  // * Kalau ada confirm() lain yang masih nunggu jawaban pas confirm() baru
  // dipanggil (harusnya gak kejadian di UI normal), anggap aja dibatalin
  // biar promise lama gak nggantung selamanya.
  resolvePromise?.(false);

  state.open = true;
  state.title = options.title;
  state.message = options.message;
  state.confirmLabel = options.confirmLabel;
  state.cancelLabel = options.cancelLabel;
  state.variant = options.variant ?? "primary";

  return new Promise<boolean>((resolve) => {
    resolvePromise = resolve;
  });
}

function settle(value: boolean) {
  state.open = false;
  resolvePromise?.(value);
  resolvePromise = null;
}

function handleConfirm() {
  settle(true);
}

function handleCancel() {
  settle(false);
}

export function useConfirm() {
  return { state, confirm, handleConfirm, handleCancel };
}
