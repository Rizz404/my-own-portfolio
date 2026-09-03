const DEFAULT_TAPS_REQUIRED = 5;
const DEFAULT_RESET_MS = 1500;

interface SecretTapOptions {
  /** Berapa kali tap beruntun sebelum onTrigger() dipanggil. Default 5. */
  taps?: number;
  /** Jeda maksimum (ms) antar tap sebelum hitungannya di-reset ke 0. Default 1500ms. */
  resetMs?: number;
}

/**
 * Gesture tersembunyi: tap/klik elemen yang sama berkali-kali beruntun buat
 * trigger onTrigger() (dipake HomeView.vue buat "pintu belakang" ke halaman
 * admin lewat foto profil, tanpa nambah tombol/link yang keliatan di UI publik).
 * Hitungan reset kalau jeda antar tap kelamaan (resetMs) atau abis nge-trigger.
 */
export function useSecretTap(onTrigger: () => void, options: SecretTapOptions = {}) {
  const tapsRequired = options.taps ?? DEFAULT_TAPS_REQUIRED;
  const resetMs = options.resetMs ?? DEFAULT_RESET_MS;

  let tapCount = 0;
  let lastTapAt = 0;

  function handleTap() {
    const now = Date.now();
    if (now - lastTapAt > resetMs) {
      tapCount = 0;
    }
    lastTapAt = now;
    tapCount++;

    if (tapCount >= tapsRequired) {
      tapCount = 0;
      onTrigger();
    }
  }

  return { handleTap };
}
