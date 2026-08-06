import { z } from "zod";
import { LanguageCode } from "@/types/api";
import { baseQueryParamsSchema } from "./api.schema";
import { optionalFileArraySchema, optionalFileSchema } from "./shared";

// * Mirror dari BlogTranslationRequest di src/types/blog.ts
export const blogTranslationRequestSchema = z.object({
  locale: z.enum(LanguageCode),
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Content is required"),
});

// * Mirror dari BlogRequest di src/types/blog.ts. `translations` wajib punya
// minimal 1 entry dan gak boleh ada locale yang double.
export const blogRequestSchema = z.object({
  isPublished: z.boolean().nullable().optional(),
  featuredImageUrl: z.url("Invalid image URL").nullable().optional(),
  viewsCount: z.number().int().min(0, "Views count cannot be negative"),
  likesCount: z.number().int().min(0, "Likes count cannot be negative"),
  dislikesCount: z.number().int().min(0, "Dislikes count cannot be negative"),
  deletedAttachmentIds: z.array(z.string()).nullable().optional(),
  translations: z
    .array(blogTranslationRequestSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) =>
        new Set(translations.map((translation) => translation.locale)).size === translations.length,
      { message: "Each locale can only be used once" },
    ),
});

// * Mirror dari BlogMultipartRequest / UpdateBlogMultipartRequest di src/types/blog.ts
export const blogMultipartRequestSchema = z.object({
  blogRequest: blogRequestSchema,
  featuredImageFile: optionalFileSchema,
  attachments: optionalFileArraySchema,
});

export const updateBlogMultipartRequestSchema = blogMultipartRequestSchema.extend({
  id: z.string().min(1, "ID is required"),
  newAttachments: optionalFileArraySchema,
});

// * Mirror dari BlogQueryParams di src/types/blog.ts
export const blogQueryParamsSchema = baseQueryParamsSchema.extend({
  search: z.string().optional(),
});

export type BlogRequestInput = z.infer<typeof blogRequestSchema>;
export type BlogTranslationRequestInput = z.infer<typeof blogTranslationRequestSchema>;
