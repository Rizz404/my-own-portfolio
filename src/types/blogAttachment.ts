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

export type BlogAttachmentQueryParams = BaseQueryParams;

export type { BlogAttachment as default };
