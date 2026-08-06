import type { BaseQueryParams, LanguageCode } from "./api";

export interface User {
  id: string; // * Tipe snowflake string di backend
  nickname: string;
  fullName: string | null;
  email: string;
  password: string | null;
  role: Role;
  provider: AuthProvider;
  profilePict: string | null;
  placeOfBirth: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  phoneNumber: string | null;
  bio: string | null;
  resolvedLocale: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// * String enum, BUKAN numeric - backend nge-serialize/deserialize enum ini pakai
// nama konstannya (mis. `"ADMIN"`, `"GITHUB"`), bukan ordinal number.
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GITHUB = "GITHUB",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export interface UserTranslationRequest {
  locale: LanguageCode;
  bio?: string | null;
}

export interface UserRequest {
  nickname: string;
  fullName?: string | null;
  email: string;
  password?: string | null;
  role?: Role | null;
  provider?: AuthProvider | null;
  profilePictUrl?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  phoneNumber?: string | null;
  address?: string | null;
  translations: UserTranslationRequest[];
}

export interface UserQueryParams extends BaseQueryParams {
  search?: string;
  role?: string;
  provider?: string;
  gender?: string;
}

export interface UserMultipartRequest {
  userRequest: UserRequest;
  profilePictFile?: File;
}

export interface UpdateUserMultipartRequest extends UserMultipartRequest {
  id: string;
}

export type { User as default };
