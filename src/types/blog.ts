import type BlogAttachment from "./blogAttachment";
import type { BaseQueryParams, LanguageCode } from "./api";

export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  resolvedLocale: string;
  isPublished: boolean | null;
  featuredImage: string | null;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  blogAttachments: BlogAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogTranslationRequest {
  locale: LanguageCode;
  title: string;
  content: string;
}

export interface BlogRequest {
  isPublished?: boolean | null;
  featuredImageUrl?: string | null;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  deletedAttachmentIds?: string[] | null;
  translations: BlogTranslationRequest[];
}

export interface BlogMultipartRequest {
  blogRequest: BlogRequest;
  featuredImageFile?: File;
  attachments?: File[];
}

export interface UpdateBlogMultipartRequest extends BlogMultipartRequest {
  id: string;
  newAttachments?: File[];
}

export interface BlogQueryParams extends BaseQueryParams {
  search?: string;
}

export type { Blog as default };
