import { z } from "zod";
import { LanguageCode } from "@/types/api";

// * Mirror dari BaseQueryParams di src/types/api.ts. Semua field query params
// bersifat opsional karena dikirim lewat query string.
export const baseQueryParamsSchema = z.object({
  cursor: z.string().optional(),
  page: z.number().int().min(1, "Page must be at least 1").optional(),
  size: z.number().int().min(1, "Size must be at least 1").optional(),
  sortBy: z.array(z.string()).optional(),
  sortDir: z.array(z.string()).optional(),
});

export const languageCodeSchema = z.enum(LanguageCode);
