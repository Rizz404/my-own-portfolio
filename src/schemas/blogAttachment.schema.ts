import { z } from "zod";
import { FileType } from "@/types/blogAttachment";
import { createQueryParamsSchema } from "./api.schema";

// * Mirror dari BlogAttachmentRequest di src/types/blogAttachment.ts
export const blogAttachmentRequestSchema = z.object({
  blogId: z.string().min(1, "Blog ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.url("Invalid file URL"),
  fileType: z.enum(FileType),
});

// * Mirror dari BlogAttachmentQueryParams di src/types/blogAttachment.ts
export const blogAttachmentQueryParamsSchema = createQueryParamsSchema(
  "blog-attachments",
).safeExtend({
  search: z.string().optional(),
  blogId: z.string().optional(),
  fileType: z.string().optional(),
});

export type BlogAttachmentRequestInput = z.infer<typeof blogAttachmentRequestSchema>;
