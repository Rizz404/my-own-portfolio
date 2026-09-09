import axiosClient from "@/api/axiosClient";
import type { SuccessResponse } from "@/types/api";
import type { AuthResponse, LoginRequest, RefreshTokenRequest, RefreshTokenResponse } from "@/types/auth";

const AUTH_URL = "/auth";

export const authService = {
  async login(request: LoginRequest) {
    const response = await axiosClient.post<SuccessResponse<AuthResponse>>(`${AUTH_URL}/login`, request);

    return response.data;
  },

  // * refreshToken cuma dikirim di body, BUKAN di header Authorization - endpoint ini
  // dipakai justru buat dapetin accessToken baru waktu accessToken lama udah expired.
  async refresh(request: RefreshTokenRequest) {
    const response = await axiosClient.post<SuccessResponse<RefreshTokenResponse>>(
      `${AUTH_URL}/refresh`,
      request,
    );

    return response.data;
  },
};
