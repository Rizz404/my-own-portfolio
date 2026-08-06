import { z } from "zod";
import { LanguageCode } from "@/types/api";
import { AuthProvider, Gender, Role } from "@/types/user";
import { baseQueryParamsSchema } from "./api.schema";
import { optionalFileSchema } from "./shared";

// * Mirror dari UserTranslationRequest di src/types/user.ts
export const userTranslationRequestSchema = z.object({
  locale: z.enum(LanguageCode),
  bio: z.string().nullable().optional(),
});

// * Mirror dari UserRequest di src/types/user.ts. Beda sama UseRequest/SkillRequest,
// role/provider/gender di sini emang langsung pakai tipe enum aslinya (bukan string).
export const userRequestSchema = z.object({
  nickname: z.string().min(1, "Nickname is required").max(50, "Nickname is too long"),
  fullName: z.string().nullable().optional(),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").nullable().optional(),
  role: z.enum(Role).nullable().optional(),
  provider: z.enum(AuthProvider).nullable().optional(),
  profilePictUrl: z.url("Invalid profile picture URL").nullable().optional(),
  placeOfBirth: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.enum(Gender).nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  translations: z
    .array(userTranslationRequestSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) => new Set(translations.map((translation) => translation.locale)).size === translations.length,
      { message: "Each locale can only be used once" },
    ),
});

// * Mirror dari UserQueryParams di src/types/user.ts
export const userQueryParamsSchema = baseQueryParamsSchema.extend({
  search: z.string().optional(),
  role: z.string().optional(),
  provider: z.string().optional(),
  gender: z.string().optional(),
});

// * Mirror dari UserMultipartRequest / UpdateUserMultipartRequest di src/types/user.ts
export const userMultipartRequestSchema = z.object({
  userRequest: userRequestSchema,
  profilePictFile: optionalFileSchema,
});

export const updateUserMultipartRequestSchema = userMultipartRequestSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export type UserRequestInput = z.infer<typeof userRequestSchema>;
export type UserTranslationRequestInput = z.infer<typeof userTranslationRequestSchema>;
