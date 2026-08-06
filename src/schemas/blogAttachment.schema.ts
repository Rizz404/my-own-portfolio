import { z } from "zod";
import { FileType } from "@/types/blogAttachment";
import { baseQueryParamsSchema } from "./api.schema";

// * Mirror dari BlogAttachmentRequest di src/types/blogAttachment.ts
export const blogAttachmentRequestSchema = z.object({
  blogId: z.string().min(1, "Blog ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.url("Invalid file URL"),
  fileType: z.enum(FileType),
});

// * Mirror dari BlogAttachmentQueryParams di src/types/blogAttachment.ts (alias BaseQueryParams)
export const blogAttachmentQueryParamsSchema = baseQueryParamsSchema;

export type BlogAttachmentRequestInput = z.infer<typeof blogAttachmentRequestSchema>;
