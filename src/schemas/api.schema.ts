import { z } from "zod";
import { LanguageCode } from "@/types/api";

// * Mirror dari BaseQueryParams di src/types/api.ts. Semua field query params
// bersifat opsional karena dikirim lewat query string.
export const baseQueryParamsSchema = z.object({
  ids: z.string().optional(),
  createdFrom: z.iso.datetime({ offset: true }).optional(),
  createdTo: z.iso.datetime({ offset: true }).optional(),
  updatedFrom: z.iso.datetime({ offset: true }).optional(),
  updatedTo: z.iso.datetime({ offset: true }).optional(),
  cursor: z.string().optional(),
  page: z.number().int().min(1, "Page must be at least 1").optional(),
  size: z
    .number()
    .int()
    .min(1, "Size must be at least 1")
    .max(100, "Size must be at most 100")
    .optional(),
  sortBy: z.array(z.string()).optional(),
  sortDir: z.array(z.string()).optional(),
});

export const languageCodeSchema = z.enum(LanguageCode);
