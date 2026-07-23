import type BlogAttachment from "./blogAttachment";

export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImage: string;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  isPublished: boolean;
  blogAttachments: BlogAttachment;
  createdAt: string;
  updatedAt: string;
}

export type { Blog as default };
