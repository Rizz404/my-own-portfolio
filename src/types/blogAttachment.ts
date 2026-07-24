import type { BaseQueryParams } from "./api";

export interface BlogAttachment {
  id: string;
  blogId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogAttachmentRequest {
  blogId?: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export type BlogAttachmentQueryParams = BaseQueryParams;

export type { BlogAttachment as default };
