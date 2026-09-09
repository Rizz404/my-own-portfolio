import type User from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// * Refresh cuma minta accessToken baru (token) - refreshToken-nya sendiri gak dirotate,
// tetep yang lama dipakai sampai dia expired (1 bulan) atau logout.
export interface RefreshTokenResponse {
  token: string;
}
