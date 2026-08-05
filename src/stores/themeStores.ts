import { defineStore } from "pinia";
import { computed } from "vue";
import { useColorMode } from "@vueuse/core";

export const useThemeStore = defineStore("theme", () => {
  // useColorMode otomatis mengurus localStorage dan menyuntikkan class 'dark' di tag <html>
  const colorMode = useColorMode({
    emitAuto: true, // Penting: Mengizinkan VueUse mengenali nilai 'auto' (System Preference)
    // Bungkus swap class-nya pakai View Transitions API (browser modern) biar
    // transisi tema jadi satu crossfade halaman (murah, satu compositor pass),
    // bukan animasiin color/border/box-shadow di tiap elemen satu-satu
    // (sempat dicoba, keroyokan animasiin ratusan card/icon bikin ngelag).
    // Browser tanpa dukungan otomatis fallback ke ganti instan.
    onChanged: (mode, defaultHandler) => {
      if (typeof document !== "undefined" && "startViewTransition" in document) {
        const transition = document.startViewTransition(() => defaultHandler(mode));
        // `ready`/`finished` reject (AbortError) if the transition gets
        // skipped - e.g. the tab is hidden, or the user toggles again before
        // the previous one finishes. That's fine, the class change itself
        // already applied; just swallow it so it doesn't surface as an
        // unhandled promise rejection in the console.
        transition.ready.catch(() => {});
        transition.finished.catch(() => {});
      } else {
        defaultHandler(mode);
      }
    },
  });

  // Fungsi untuk beralih (toggle) dengan urutan: System (auto) -> Light -> Dark
  const toggleTheme = () => {
    if (colorMode.store.value === "auto") {
      colorMode.value = "light";
    } else if (colorMode.store.value === "light") {
      colorMode.value = "dark";
    } else {
      colorMode.value = "auto";
    }
  };

  // Kita gunakan .store.value agar UI tahu persis state apa yang sedang aktif
  // (karena colorMode.value hanya akan mereturn 'light' atau 'dark' hasil resolusi sistem)
  const currentTheme = computed(() => colorMode.store.value);

  return { colorMode, currentTheme, toggleTheme };
});
