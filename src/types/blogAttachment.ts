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

export enum FileType {
  image,
  document,
  video,
  audio,
  archive,
  other,
}

export interface BlogAttachmentRequest {
  blogId: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
}

export type BlogAttachmentQueryParams = BaseQueryParams;

export type { BlogAttachment as default };
