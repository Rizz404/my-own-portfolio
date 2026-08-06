import type { Component } from "vue";
import IconCircleCheck from "~icons/lucide/circle-check";
import IconInfo from "~icons/lucide/info";
import IconTriangleAlert from "~icons/lucide/triangle-alert";

export type AlertVariant = "danger" | "success" | "warning" | "info";

// * Sumber kebenaran tunggal buat ikon & warna tiap variant, dipakai bareng
// sama AppAlert.vue (inline banner) dan AppToastContainer.vue (toast) - biar
// kalau ganti palet/icon suatu saat, cukup ubah di satu tempat aja.
export const alertVariantIcons: Record<AlertVariant, Component> = {
  danger: IconTriangleAlert,
  warning: IconTriangleAlert,
  success: IconCircleCheck,
  info: IconInfo,
};

export const alertVariantClasses: Record<AlertVariant, string> = {
  danger: "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  info: "bg-info/10 text-info border-info/20",
};
