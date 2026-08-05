import { createI18n } from "vue-i18n";

// * Locale yang didukung untuk UI, selaras dengan LanguageCode di @/types/api
export type SupportedLocale = "en" | "id";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "id"];
export const DEFAULT_LOCALE: SupportedLocale = "en";

// TODO: isi terjemahannya di src/locales/en.json & src/locales/id.json, lalu import di sini
const messages = {
  en: {},
  id: {},
} satisfies Record<SupportedLocale, object>;

export const i18n = createI18n({
  legacy: false, // * Pakai Composition API (useI18n()), bukan this.$t di Options API
  globalInjection: true, // * Tetep bisa pakai $t / $d / $n langsung di template tanpa useI18n()
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});

export default i18n;
