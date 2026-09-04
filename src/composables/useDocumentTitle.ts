import { watchEffect, toValue, type MaybeRefOrGetter } from "vue";

// * Nama situs yang jadi suffix tetap di semua tab browser, mis. "Home - Rizqiansyah"
const SITE_NAME = "Rizqiansyah";

// * Dipakai App.vue buat title generik per-route (dari meta.titleKey) dan detail view
// (Blog/Project/Use) buat nimpa title generik itu pakai judul konten asli setelah kefetch.
// `onlyWhenPresent: true` bikin composable ini diem aja selama title-nya masih kosong
// (mis. lagi loading), biar gak numpuk balik ke fallback "Rizqiansyah" polos duluan.
export function useDocumentTitle(
  title: MaybeRefOrGetter<string | undefined | null>,
  options: { onlyWhenPresent?: boolean } = {},
) {
  watchEffect(() => {
    const value = toValue(title);

    if (!value) {
      if (options.onlyWhenPresent) return;
      document.title = SITE_NAME;
      return;
    }

    document.title = `${value} - ${SITE_NAME}`;
  });
}
