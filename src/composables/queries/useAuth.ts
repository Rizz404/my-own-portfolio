import { authService } from "@/services/authService";
import { authStores } from "@/stores/authStores";
import type { LoginRequest } from "@/types/auth";
import { useMutation } from "@tanstack/vue-query";

export const useLoginMutation = () => {
  const authStore = authStores();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => {
      return authService.login(credentials);
    },
    onSuccess: (response) => {
      authStore.login(response.data.token, response.data.user);
    },
  });
};
