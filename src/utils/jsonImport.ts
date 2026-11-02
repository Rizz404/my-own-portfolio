import { LanguageCode } from "@/types/api";

// * Form admin selalu nyimpen persis 2 translation (en & id) dan baca pakai find() +
// non-null assert. JSON dari backend bisa aja cuma punya 1 locale, jadi sebelum di-apply
// ke form, translations dilengkapi dulu: locale yang gak ada di JSON diisi `empty(locale)`.
export function fillLocales<T extends { locale: LanguageCode }>(
  translations: T[],
  empty: (locale: LanguageCode) => T,
): T[] {
  return [LanguageCode.en, LanguageCode.id].map(
    (locale) => translations.find((translation) => translation.locale === locale) ?? empty(locale),
  );
}
