import type BlogAttachment from "./blogAttachment";
import type { BaseQueryParams } from "./api";

export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImage: string | null;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  isPublished: boolean | null;
  blogAttachments: BlogAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogRequest {
  title: string;
  content?: string | null;
  featuredImageUrl?: string | null;
  isPublished?: boolean | null;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  deletedAttachmentIds?: string[] | null;
}

export interface BlogQueryParams extends BaseQueryParams {
  search?: string;
}

export type { Blog as default };
