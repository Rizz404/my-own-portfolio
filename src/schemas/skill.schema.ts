import { z } from "zod";
import { LanguageCode } from "@/types/api";
import { SkillCategory } from "@/types/skill";
import { baseQueryParamsSchema } from "./api.schema";
import { enumStringKeys, optionalFileSchema } from "./shared";

// * Mirror dari SkillTranslationRequest di src/types/skill.ts
export const skillTranslationRequestSchema = z.object({
  locale: z.enum(LanguageCode),
  description: z.string().nullable().optional(),
});

// * Mirror dari SkillRequest di src/types/skill.ts. `category` di tipe aslinya
// `string` (bukan langsung enum SkillCategory), jadi divalidasi terhadap key-nya.
export const skillRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  category: z.enum(enumStringKeys(SkillCategory), "Please select a valid category"),
  logoUrl: z.url("Invalid logo URL").nullable().optional(),
  translations: z
    .array(skillTranslationRequestSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) => new Set(translations.map((translation) => translation.locale)).size === translations.length,
      { message: "Each locale can only be used once" },
    ),
});

// * Mirror dari SkillMultipartRequest / UpdateSkillMultipartRequest di src/types/skill.ts
export const skillMultipartRequestSchema = z.object({
  skillRequest: skillRequestSchema,
  logoFile: optionalFileSchema,
});

export const updateSkillMultipartRequestSchema = skillMultipartRequestSchema.extend({
  id: z.string().min(1, "ID is required"),
});

// * Mirror dari SkillQueryParams di src/types/skill.ts
export const skillQueryParamsSchema = baseQueryParamsSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
});

export type SkillRequestInput = z.infer<typeof skillRequestSchema>;
export type SkillTranslationRequestInput = z.infer<typeof skillTranslationRequestSchema>;
