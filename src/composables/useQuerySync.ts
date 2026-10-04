import { useRoute, useRouter } from "vue-router";
import { onMounted, watch, type Ref } from "vue";
import { createQueryParamsSchema } from "@/schemas/api.schema";
import { getFilterFields, type FilterResource } from "@/utils/advancedFilters";

interface QuerySyncOptions {
  persistFilters?: { resource: FilterResource; exclude?: string[] };
}

/**
 * * Sinkronin ref query params (yang dipake buat manggil API - search/status/sort/
 * page/size) ke query string di URL, biar state filter/sort yang lagi aktif
 * "gampang diprediksi": bisa di-share/reload/back-forward browser tanpa ilang.
 *
 * Cara kerja:
 * - Tipe decode/encode tiap field ditebak dari value awal `params.value` pas
 *   composable ini dipanggil (array -> comma-separated string, number -> number,
 *   boolean -> "true"/"false", sisanya string). Optional boolean isCurrent/isPublished
 *   dan number minViews/maxViews memakai tipe eksplisit meskipun default undefined.
 *   Parameter berulang digabung dengan koma. Makanya field opsional yang mau
 *   ikut di-sync (mis. `status`) wajib dikasih key-nya di literal awal (boleh
 *   `undefined`), bukan cuma dideklarasiin di tipe.
 * - Field yang nilainya balik ke default otomatis dibuang dari URL, biar gak
 *   numpuk query kosong (`?page=1&search=&status=`).
 * - Baca dari URL cuma sekali pas komponen di-setup (query awal nge-override
 *   default) - abis itu sinkronnya cuma satu arah (params -> URL) pakai
 *   `router.replace` (gak nambah history entry baru tiap ketik/klik).
 * - Query param yang gak dikenal (di luar key `params`, mis. `redirect` abis
 *   login) dibiarin apa adanya, gak ikut ke-strip.
 * - `persistFilters` menyimpan filter lanjutan di localStorage per nama route.
 *   Filter dipulihkan sebelum URL dibaca; URL dengan filter eksplisit mengganti
 *   filter tersimpan. Reset menghapus filter dari storage. Pagination/sort tidak
 *   ikut disimpan, dan halaman publik/admin punya penyimpanan terpisah.
 *
 * PENTING: panggil ini SEBELUM bikin ref UI lain yang nyontek initial value dari
 * `params.value` (mis. `searchInput = ref(queryParams.value.search ?? "")`),
 * soalnya proses baca-dari-URL di sini jalan sinkron (bukan di `onMounted`).
 */
export function useQuerySync<T extends Record<string, unknown>>(
  params: Ref<T>,
  options: QuerySyncOptions = {},
) {
  const route = useRoute();
  const router = useRouter();

  // * Snapshot value awal buat nebak tipe tiap field & nentuin kapan suatu field
  // dianggap "balik ke default" (jadi boleh dibuang dari URL).
  const defaults = { ...params.value };
  const routePath = route.path;
  const persistedKeys = options.persistFilters
    ? getFilterFields(options.persistFilters.resource, options.persistFilters.exclude)
        .map(({ key }) => key)
        .filter((key) => key in defaults)
    : [];
  const storageKey = `portfolio:advanced-filters:v1:${String(route.name ?? routePath)}`;

  function decodeValue(key: string, raw: string): unknown {
    const defaultValue = defaults[key];
    if (Array.isArray(defaultValue)) {
      const values = raw.split(",").filter(Boolean);
      // Older shared URLs may contain stacked sorting; preserve the first choice.
      return key === "sortBy" || key === "sortDir" ? values.slice(0, 1) : values;
    }
    if (typeof defaultValue === "number" || ["minViews", "maxViews"].includes(key)) {
      const num = Number(raw);
      if (!Number.isSafeInteger(num) || num < (["minViews", "maxViews"].includes(key) ? 0 : 1))
        return defaultValue;
      return key === "size" ? Math.min(num, 100) : num;
    }
    if (typeof defaultValue === "boolean" || ["isCurrent", "isPublished"].includes(key)) {
      if (raw === "true") return true;
      if (raw === "false") return false;
      return defaultValue;
    }
    return raw;
  }

  function encodeValue(value: unknown): string | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (Array.isArray(value)) return value.length ? value.join(",") : undefined;
    return String(value);
  }

  const hasExplicitFilters = persistedKeys.some((key) => key in route.query);
  if (persistedKeys.length && !hasExplicitFilters) {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const restored: Record<string, unknown> = {};
        for (const key of persistedKeys) {
          const value = (saved as Record<string, unknown>)[key];
          if (typeof value === "string" && value !== "") restored[key] = decodeValue(key, value);
        }
        params.value = { ...params.value, ...restored };
      }
    } catch {
      // Storage may be unavailable or contain invalid JSON; URL filters still work.
    }
  }

  // * Inisialisasi sekali dari query string yang ada pas komponen mount (mis. abis
  // reload / paste link yang ada query-nya).
  const patch: Partial<T> = {};
  for (const key of Object.keys(defaults)) {
    const queryValue = route.query[key];
    const raw = Array.isArray(queryValue) ? queryValue.filter(Boolean).join(",") : queryValue;
    if (typeof raw === "string" && raw !== "") {
      (patch as Record<string, unknown>)[key] = decodeValue(key, raw);
    }
  }
  if (Object.keys(patch).length > 0) {
    params.value = { ...params.value, ...patch };
  }

  // Validate sorting restored from an external URL before the first query runs.
  const resource = options.persistFilters?.resource;
  if (
    resource &&
    !createQueryParamsSchema(resource).safeParse({
      sortBy: params.value.sortBy,
      sortDir: params.value.sortDir,
      cursor: params.value.cursor,
    }).success
  ) {
    params.value = {
      ...params.value,
      sortBy: defaults.sortBy,
      sortDir: defaults.sortDir,
      cursor: defaults.cursor,
    };
  }

  function persistFilters(value: T) {
    if (!persistedKeys.length) return;
    const saved: Record<string, string> = {};
    for (const key of persistedKeys) {
      const encoded = encodeValue(value[key]);
      if (encoded !== undefined) saved[key] = encoded;
    }
    try {
      if (Object.keys(saved).length) localStorage.setItem(storageKey, JSON.stringify(saved));
      else localStorage.removeItem(storageKey);
    } catch {
      // Keep the filters usable even when browser storage is disabled.
    }
  }
  persistFilters(params.value);
  // Save immediately so navigating to a form cannot discard the latest filters.
  watch(params, persistFilters, { deep: true, flush: "sync" });

  function syncToUrl(value: T) {
    // A queued search/filter update must not replace the destination page's URL.
    if (route.path !== routePath) return;
    const query: Record<string, string> = {};

    for (const [key, raw] of Object.entries(route.query)) {
      if (!(key in defaults) && typeof raw === "string") query[key] = raw;
    }

    for (const key of Object.keys(defaults)) {
      const current = (value as Record<string, unknown>)[key];
      const isDefault = JSON.stringify(current) === JSON.stringify(defaults[key]);
      if (isDefault) continue;

      const encoded = encodeValue(current);
      if (encoded !== undefined) query[key] = encoded;
    }

    // Also replace an unchanged URL: a restore may still be pending when Reset runs.
    router.replace({ query });
  }
  watch(params, syncToUrl, { deep: true });
  if (persistedKeys.length) onMounted(() => syncToUrl(params.value));
}
