export interface User {
  id: string; // * Tipe snowflake string di backend
  nickname: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  provider: AuthProvider;
  profilePict: string;
  placeOfBirth: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber: string;
  bio: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  USER,
  ADMIN,
}

export enum AuthProvider {
  LOCAL,
  GITHUB,
}

export enum Gender {
  MALE,
  FEMALE,
  OTHER,
  PREFER_NOT_TO_SAY,
}

export type { User as default };
