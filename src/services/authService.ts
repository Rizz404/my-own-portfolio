import axiosClient from "@/api/axiosClient";
import type { SuccessResponse } from "@/types/api";
import type { AuthResponse, LoginRequest } from "@/types/auth";

const AUTH_URL = "/auth/login";

export const authService = {
  async login(request: LoginRequest) {
    const response = await axiosClient.post<SuccessResponse<AuthResponse>>(AUTH_URL, request);

    return response.data;
  },
};
