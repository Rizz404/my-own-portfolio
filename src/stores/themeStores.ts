import { defineStore } from "pinia";
import { computed } from "vue";
import { useColorMode } from "@vueuse/core";

export const useThemeStore = defineStore("theme", () => {
  // useColorMode otomatis mengurus localStorage dan menyuntikkan class 'dark' di tag <html>
  const colorMode = useColorMode({
    emitAuto: true, // Penting: Mengizinkan VueUse mengenali nilai 'auto' (System Preference)
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
