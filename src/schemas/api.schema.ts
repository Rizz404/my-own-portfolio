import { z } from "zod";
import { resourceSortFields } from "@/utils/sorting";
import type { FilterResource } from "@/utils/advancedFilters";
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
  sortBy: z.array(z.string()).length(1).optional(),
  sortDir: z
    .array(z.enum(["asc", "desc"]))
    .length(1)
    .optional(),
});

export const languageCodeSchema = z.enum(LanguageCode);

export function createQueryParamsSchema(resource: FilterResource) {
  return baseQueryParamsSchema
    .extend({
      sortBy: baseQueryParamsSchema.shape.sortBy.refine(
        (fields) =>
          !fields ||
          fields.every((field) =>
            (resourceSortFields[resource] as readonly string[]).includes(field),
          ),
        "Unsupported sort field",
      ),
    })
    .superRefine((params, context) => {
      if (
        params.cursor !== undefined &&
        (params.sortBy?.some((field) => field !== "id") ||
          params.sortDir?.some((direction) => direction !== "desc"))
      ) {
        context.addIssue({
          code: "custom",
          path: ["cursor"],
          message: "Cursor pagination only supports id DESC",
        });
      }
    });
}
