import { z } from "zod";
import { LanguageCode } from "@/types/api";
import { baseQueryParamsSchema } from "./api.schema";

// * Mirror dari ExperienceTranslationRequest di src/types/experience.ts
export const experienceTranslationRequestSchema = z.object({
  locale: z.enum(LanguageCode),
  position: z.string().min(1, "Position is required").max(255, "Position is too long"),
  description: z.string().nullable().optional(),
  jobdesks: z.array(z.string()).nullable().optional(),
});

// * Mirror dari ExperienceRequest di src/types/experience.ts. `endDate` gak boleh
// lebih awal dari `startDate` kalau keduanya keisi.
export const experienceRequestSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required").max(255, "Company name is too long"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().nullable().optional(),
    isCurrent: z.boolean().nullable().optional(),
    translations: z
      .array(experienceTranslationRequestSchema)
      .min(1, "At least one translation is required")
      .refine(
        (translations) =>
          new Set(translations.map((translation) => translation.locale)).size === translations.length,
        { message: "Each locale can only be used once" },
      ),
  })
  .refine(
    (data) => !data.endDate || !data.startDate || new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date cannot be earlier than start date", path: ["endDate"] },
  );

// * Mirror dari ExperienceQueryParams di src/types/experience.ts
export const experienceQueryParamsSchema = baseQueryParamsSchema.extend({
  search: z.string().optional(),
  isCurrent: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ExperienceRequestInput = z.infer<typeof experienceRequestSchema>;
export type ExperienceTranslationRequestInput = z.infer<typeof experienceTranslationRequestSchema>;
