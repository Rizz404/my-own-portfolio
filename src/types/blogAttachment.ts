import type { SortField } from "@/utils/sorting";
import type { BaseQueryParams } from "./api";

export interface BlogAttachment {
  id: string;
  blogId: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
  createdAt: string;
  updatedAt: string;
}

// * String enum, BUKAN numeric - backend nge-serialize/deserialize enum ini pakai
// nama konstannya (mis. `"image"`, `"document"`), bukan ordinal number.
export enum FileType {
  image = "image",
  document = "document",
  video = "video",
  audio = "audio",
  archive = "archive",
  other = "other",
}

export interface BlogAttachmentRequest {
  blogId: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
}

export interface BlogAttachmentQueryParams extends BaseQueryParams<SortField<"blog-attachments">> {
  search?: string;
  blogId?: string;
  fileType?: string;
}

export type { BlogAttachment as default };
