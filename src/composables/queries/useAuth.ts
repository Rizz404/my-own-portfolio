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
      authStore.login(response.data.token, response.data.user);
    },
  });
};
