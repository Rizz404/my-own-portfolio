import { createI18n, type LocaleMessageValue, type VueMessageType } from "vue-i18n";

// * vue-i18n gak nge-export `LocaleMessage` langsung dari root package, jadi disusun ulang
// dari `LocaleMessageValue` yang di-export (bentuknya sama persis)
type LocaleMessage = Record<string, LocaleMessageValue<VueMessageType>>;

// * Locale yang didukung untuk UI, selaras dengan LanguageCode di @/types/api
export type SupportedLocale = "en" | "id";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "id"];
export const DEFAULT_LOCALE: SupportedLocale = "en";

// * 1 file JSON = 1 view/component, letaknya di src/locales/<locale>/... dengan struktur folder
// yang sama persis kayak src/views & src/components (mis. src/locales/en/views/user/AboutView.json).
// Di-scan otomatis pakai import.meta.glob, jadi nambah file baru gak perlu sentuh file ini lagi.
const localeModules = import.meta.glob<Record<string, unknown>>("../locales/*/**/*.json", {
  eager: true,
  import: "default",
});

// * Susun ulang jadi nested object mengikuti path foldernya, mis.
// "../locales/en/views/user/AboutView.json" -> messages.en.views.user.AboutView
function buildMessages(locale: SupportedLocale): LocaleMessage {
  const prefix = `../locales/${locale}/`;
  const messages: Record<string, unknown> = {};

  for (const [path, content] of Object.entries(localeModules)) {
    if (!path.startsWith(prefix)) continue;

    const segments = path.slice(prefix.length).replace(/\.json$/, "").split("/");
    let node = messages;

    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        node[segment] = content;
        return;
      }
      node[segment] ??= {};
      node = node[segment] as Record<string, unknown>;
    });
  }

  return messages as LocaleMessage;
}

const messages: Record<SupportedLocale, LocaleMessage> = {
  en: buildMessages("en"),
  id: buildMessages("id"),
};

export const i18n = createI18n({
  legacy: false, // * Pakai Composition API (useI18n()), bukan this.$t di Options API
  globalInjection: true, // * Tetep bisa pakai $t / $d / $n langsung di template tanpa useI18n()
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});

export default i18n;
