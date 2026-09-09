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
  // * refreshToken (umur 1 bulan) cuma dipakai buat nuker accessToken (token, umur 3 hari)
  // yang udah expired lewat authService.refresh() - gak pernah dikirim sebagai Authorization header.
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken") || null);

  // * Getters
  // * Sengaja juga cek role === ADMIN, bukan cuma !!token - punya token valid doang
  // (mis. akun dengan role USER) gak cukup buat dianggap "authenticated" di area admin.
  const isAuthenticated = computed(() => !!token.value && user.value?.role === Role.ADMIN);

  // * Actions
  const login = (newToken: string, newRefreshToken: string, userData: User) => {
    token.value = newToken;
    refreshToken.value = newRefreshToken;
    user.value = userData;
    // * Persist token, refreshToken & user biar tetep login (dan role-nya kebawa) setelah refresh
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // * Dipanggil setelah authService.refresh() sukses - cuma accessToken yang diganti,
  // refreshToken & user gak berubah.
  const setAccessToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    setAccessToken,
    logout,
  };
});

export default authStores;
