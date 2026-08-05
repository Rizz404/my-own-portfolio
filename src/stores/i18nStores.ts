import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { useNavigatorLanguage, useStorage } from "@vueuse/core";
import { LanguageCode } from "@/types/api";
import i18n, { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n";
import { setAcceptLanguage } from "@/api/axiosClient";

// * Preferensi locale yang bisa dipilih user: "system" ikut bahasa browser,
// atau salah satu locale yang didukung secara eksplisit (mirip pola "auto" di themeStores)
export type LocalePreference = "system" | SupportedLocale;

// * Ambil 2 huruf pertama (mis. "en-US" -> "en") lalu cocokkan ke locale yang didukung,
// kalau bukan salah satu dari itu (mis. "ja") jatuhkan ke default
function resolveSupportedLocale(lang: string | null | undefined): SupportedLocale {
  const code = (lang ?? "").slice(0, 2).toLowerCase();
  return SUPPORTED_LOCALES.includes(code as SupportedLocale) ? (code as SupportedLocale) : DEFAULT_LOCALE;
}

export const useI18nStore = defineStore("i18n", () => {
  // * Preferensi user disimpan di localStorage, defaultnya "system"
  const localePreference = useStorage<LocalePreference>("locale", "system");

  // * Reactive, otomatis update kalau bahasa browser berubah (event "languagechange")
  const { language: browserLanguage } = useNavigatorLanguage();

  // * Locale aktual yang dipakai UI setelah resolusi "system"
  const currentLocale = computed<SupportedLocale>(() =>
    localePreference.value === "system"
      ? resolveSupportedLocale(browserLanguage.value)
      : localePreference.value,
  );

  // * Versi enum dari locale aktual, buat dikirim ke API (translations, dst)
  const currentLanguageCode = computed<LanguageCode>(() =>
    currentLocale.value === "id" ? LanguageCode.id : LanguageCode.en,
  );

  const setLocalePreference = (preference: LocalePreference) => {
    localePreference.value = preference;
  };

  // * Sinkronkan locale vue-i18n & header Accept-Language axiosClient tiap kali locale aktual berubah
  watch(
    currentLocale,
    (locale) => {
      i18n.global.locale.value = locale;
      setAcceptLanguage(locale);
    },
    { immediate: true },
  );

  return {
    localePreference,
    currentLocale,
    currentLanguageCode,
    supportedLocales: SUPPORTED_LOCALES,
    setLocalePreference,
  };
});

export default useI18nStore;
