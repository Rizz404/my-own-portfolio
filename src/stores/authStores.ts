import type User from "@/types/user";
import { Role } from "@/types/user";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// * User sebelumnya cuma disimpan di memory (ref(null)), gak dipersist ke localStorage
// kayak token - jadi tiap refresh, user.value balik jadi null padahal token-nya masih ada
// di localStorage. Ini bikin isAuthenticated (dulu cuma cek !!token) selalu true walau
// role-nya belum sempat diketahui lagi, dan gak ada cara buat re-check role setelah reload.
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const authStores = defineStore("auth", () => {
  // * Statenya
  const user = ref<User | null>(readStoredUser());
  const token = ref<string | null>(localStorage.getItem("token") || null);

  // * Getters
  // * Sengaja juga cek role === ADMIN, bukan cuma !!token - punya token valid doang
  // (mis. akun dengan role USER) gak cukup buat dianggap "authenticated" di area admin.
  const isAuthenticated = computed(() => !!token.value && user.value?.role === Role.ADMIN);

  // * Actions
  const login = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
    // * Persist token & user biar tetep login (dan role-nya kebawa) setelah refresh
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
});

export default authStores;
