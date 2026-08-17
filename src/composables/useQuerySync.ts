import { useRoute, useRouter } from "vue-router";
import { watch, type Ref } from "vue";

/**
 * * Sinkronin ref query params (yang dipake buat manggil API - search/status/sort/
 * page/size) ke query string di URL, biar state filter/sort yang lagi aktif
 * "gampang diprediksi": bisa di-share/reload/back-forward browser tanpa ilang.
 *
 * Cara kerja:
 * - Tipe decode/encode tiap field ditebak dari value awal `params.value` pas
 *   composable ini dipanggil (array -> comma-separated string, number -> number,
 *   boolean -> "true"/"false", sisanya string) - makanya field opsional yang mau
 *   ikut di-sync (mis. `status`) wajib dikasih key-nya di literal awal (boleh
 *   `undefined`), bukan cuma dideklarasiin di tipe.
 * - Field yang nilainya balik ke default otomatis dibuang dari URL, biar gak
 *   numpuk query kosong (`?page=1&search=&status=`).
 * - Baca dari URL cuma sekali pas komponen di-setup (query awal nge-override
 *   default) - abis itu sinkronnya cuma satu arah (params -> URL) pakai
 *   `router.replace` (gak nambah history entry baru tiap ketik/klik).
 * - Query param yang gak dikenal (di luar key `params`, mis. `redirect` abis
 *   login) dibiarin apa adanya, gak ikut ke-strip.
 *
 * PENTING: panggil ini SEBELUM bikin ref UI lain yang nyontek initial value dari
 * `params.value` (mis. `searchInput = ref(queryParams.value.search ?? "")`),
 * soalnya proses baca-dari-URL di sini jalan sinkron (bukan di `onMounted`).
 */
export function useQuerySync<T extends Record<string, unknown>>(params: Ref<T>) {
  const route = useRoute();
  const router = useRouter();

  // * Snapshot value awal buat nebak tipe tiap field & nentuin kapan suatu field
  // dianggap "balik ke default" (jadi boleh dibuang dari URL).
  const defaults = { ...params.value };

  function decodeValue(key: string, raw: string): unknown {
    const defaultValue = defaults[key];
    if (Array.isArray(defaultValue)) return raw.split(",").filter(Boolean);
    if (typeof defaultValue === "number") {
      const num = Number(raw);
      return Number.isNaN(num) ? defaultValue : num;
    }
    if (typeof defaultValue === "boolean") return raw === "true";
    return raw;
  }

  function encodeValue(value: unknown): string | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (Array.isArray(value)) return value.length ? value.join(",") : undefined;
    return String(value);
  }

  // * Inisialisasi sekali dari query string yang ada pas komponen mount (mis. abis
  // reload / paste link yang ada query-nya).
  const patch: Partial<T> = {};
  for (const key of Object.keys(defaults)) {
    const raw = route.query[key];
    if (typeof raw === "string" && raw !== "") {
      (patch as Record<string, unknown>)[key] = decodeValue(key, raw);
    }
  }
  if (Object.keys(patch).length > 0) {
    params.value = { ...params.value, ...patch };
  }

  watch(
    params,
    (value) => {
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

      router.replace({ query });
    },
    { deep: true },
  );
}
