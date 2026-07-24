import type { BaseQueryParams } from "./api";

export interface Project {
  id: string; // * Tipe snowflake string di backend
  slug: string;
  name: string;
  description: string | null;
  status: string;
  logoUrl: string | null;
  imageUrls: string[] | null;
  projectLinks: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string | null;
  status: string;
  logoUrl?: string | null;
  imageUrls?: string[] | null;
  projectLinks?: Record<string, string> | null;
  deletedImageUrls?: string[] | null;
}

export interface ProjectQueryParams extends BaseQueryParams {
  search?: string;
  status?: string;
}

export type { Project as default };
