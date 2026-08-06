import { z } from "zod";
import { LanguageCode } from "@/types/api";
import { LinkType, ProjectStatus, ProjectType } from "@/types/project";
import { baseQueryParamsSchema } from "./api.schema";
import { optionalFileArraySchema, optionalFileSchema } from "./shared";

// * Mirror dari ProjectTranslationRequest di src/types/project.ts
export const projectTranslationRequestSchema = z.object({
  locale: z.enum(LanguageCode),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().nullable().optional(),
});

// * Mirror dari ProjectRequest di src/types/project.ts
export const projectRequestSchema = z.object({
  translations: z
    .array(projectTranslationRequestSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) => new Set(translations.map((translation) => translation.locale)).size === translations.length,
      { message: "Each locale can only be used once" },
    ),
  status: z.enum(ProjectStatus),
  logoUrl: z.url("Invalid logo URL").nullable().optional(),
  imageUrls: z.array(z.url("Invalid image URL")).nullable().optional(),
  techStack: z.record(z.string(), z.string()).nullable().optional(),
  projectTypes: z.array(z.enum(ProjectType)).nullable().optional(),
  projectLinks: z.partialRecord(z.enum(LinkType), z.url("Invalid link URL")).nullable().optional(),
  deletedImageUrls: z.array(z.string()).nullable().optional(),
});

// * Mirror dari ProjectMultipartRequest / UpdateProjectMultipartRequest di src/types/project.ts
export const projectMultipartRequestSchema = z.object({
  projectRequest: projectRequestSchema,
  logoFile: optionalFileSchema,
  imageFiles: optionalFileArraySchema,
});

export const updateProjectMultipartRequestSchema = projectMultipartRequestSchema.extend({
  id: z.string().min(1, "ID is required"),
  newImageFiles: optionalFileArraySchema,
});

// * Mirror dari ProjectQueryParams di src/types/project.ts
export const projectQueryParamsSchema = baseQueryParamsSchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
});

export type ProjectRequestInput = z.infer<typeof projectRequestSchema>;
export type ProjectTranslationRequestInput = z.infer<typeof projectTranslationRequestSchema>;
