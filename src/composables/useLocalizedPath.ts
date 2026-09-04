import { useI18nStore } from "@/stores/i18nStores";

// * Nempelin prefix locale aktif (/en, /id) di depan path publik, biar semua link internal
// otomatis ngikutin bahasa yang lagi aktif tanpa perlu inget nulis locale-nya manual tiap
// nulis RouterLink. Pemakaian: withLocale("/about") -> "/en/about" (atau "/id/about"),
// withLocale("/") -> "/en" (tanpa trailing slash).
export function useLocalizedPath() {
  const i18nStore = useI18nStore();

  const withLocale = (path: string) => `/${i18nStore.currentLocale}${path === "/" ? "" : path}`;

  return { withLocale };
}
