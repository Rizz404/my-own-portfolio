import { authService } from "@/services/authService";
import { authStores } from "@/stores/authStores";
import type { LoginRequest } from "@/types/auth";
import { Role } from "@/types/user";
import { useMutation } from "@tanstack/vue-query";

// * Dilempar kalau kredensialnya valid tapi role-nya bukan ADMIN, biar LoginView bisa
// bedain ini dari error kredensial biasa dan nampilin pesan yang sesuai (lihat errorMessage
// di LoginView.vue).
export const ADMIN_ACCESS_DENIED = "ADMIN_ACCESS_DENIED";

export const useLoginMutation = () => {
  const authStore = authStores();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authService.login(credentials);

      // * Endpoint login dipakai bersama, backend gak nge-reject role USER di sini -
      // jadi role-nya divalidasi di sisi klien sebelum sesinya dianggap authenticated.
      if (response.data.user.role !== Role.ADMIN) {
        throw new Error(ADMIN_ACCESS_DENIED);
      }

      return response;
    },
    onSuccess: (response) => {
      authStore.login(response.data.token, response.data.refreshToken, response.data.user);
    },
  });
};

// * Dipanggil dari luar reactive context (lewat setRefreshHandler di axiosClient, diwire di
// main.ts) waktu ada request yang balik 401 - bukan useMutation karena axios interceptor
// bukan komponen Vue. Balikin accessToken baru kalau refresh sukses, null kalau refreshToken-nya
// gak ada/udah invalid (expired 1 bulan) - axiosClient bakal logout otomatis lewat unauthorizedHandler.
export const refreshAccessToken = async (): Promise<string | null> => {
  const authStore = authStores();
  const currentRefreshToken = authStore.refreshToken;

  if (!currentRefreshToken) return null;

  try {
    const response = await authService.refresh({ refreshToken: currentRefreshToken });
    authStore.setAccessToken(response.data.token);

    return response.data.token;
  } catch {
    return null;
  }
};
