import { z } from "zod";
import { LanguageCode } from "@/types/api";
import { Category } from "@/types/use";
import { baseQueryParamsSchema } from "./api.schema";
import { enumStringKeys, optionalFileArraySchema, optionalFileSchema } from "./shared";

// * Mirror dari UseTranslationRequest di src/types/use.ts
export const useTranslationRequestSchema = z.object({
  locale: z.enum(LanguageCode),
  reasons: z.string().nullable().optional(),
});

// * Mirror dari UseRequest di src/types/use.ts. `category` di tipe aslinya `string`
// (bukan langsung enum Category), jadi divalidasi terhadap key-nya.
export const useRequestSchema = z.object({
  itemName: z.string().min(1, "Item name is required").max(255, "Item name is too long"),
  category: z.enum(enumStringKeys(Category), "Please select a valid category"),
  logoUrl: z.url("Invalid logo URL").nullable().optional(),
  pictures: z.array(z.url("Invalid picture URL")).nullable().optional(),
  links: z.array(z.url("Invalid link URL")).nullable().optional(),
  deletedPictures: z.array(z.string()).nullable().optional(),
  translations: z
    .array(useTranslationRequestSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) => new Set(translations.map((translation) => translation.locale)).size === translations.length,
      { message: "Each locale can only be used once" },
    ),
});

// * Mirror dari UseQueryParams di src/types/use.ts
export const useQueryParamsSchema = baseQueryParamsSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
});

// * Mirror dari UseMultipartRequest / UpdateUseMultipartRequest di src/types/use.ts
export const useMultipartRequestSchema = z.object({
  useRequest: useRequestSchema,
  logoFile: optionalFileSchema,
  pictureFiles: optionalFileArraySchema,
});

export const updateUseMultipartRequestSchema = useMultipartRequestSchema.extend({
  id: z.string().min(1, "ID is required"),
  newPictureFiles: optionalFileArraySchema,
});

export type UseRequestInput = z.infer<typeof useRequestSchema>;
export type UseTranslationRequestInput = z.infer<typeof useTranslationRequestSchema>;
