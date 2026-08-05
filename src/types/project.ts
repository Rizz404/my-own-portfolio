import type { BaseQueryParams, LanguageCode } from "./api";

export interface Project {
  id: string; // * Tipe snowflake string di backend
  slug: string;
  name: string;
  description: string | null;
  resolvedLocale: string;
  status: ProjectStatus;
  logoUrl: string | null;
  imageUrls: string[] | null;
  techStack: Record<string, string> | null;
  projectTypes: ProjectType[];
  projectLinks: Record<LinkType, string> | null;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  active,
  inactive,
  development,
  maintenance,
  archived,
}

export enum ProjectType {
  frontend,
  backend,
  fullstack,
  mobile,
  desktop,
  api,
  library,
  other,
}

export enum LinkType {
  github,
  gitlab,
  bitbucket,
  source_code,
  demo,
  website,
  figma,
  documentation,
  api_docs,
  video,
  playstore,
  appstore,
  npm,
  dockerhub,
  staging,
  other,
}

export interface ProjectTranslationRequest {
  locale: LanguageCode;
  name: string;
  description?: string | null;
}

export interface ProjectRequest {
  translations: ProjectTranslationRequest[];
  status: ProjectStatus;
  logoUrl?: string | null;
  imageUrls?: string[] | null;
  techStack?: Record<string, string> | null;
  projectTypes?: ProjectType[] | null;
  projectLinks?: Record<LinkType, string> | null;
  deletedImageUrls?: string[] | null;
}

export interface ProjectMultipartRequest {
  projectRequest: ProjectRequest;
  logoFile?: File;
  imageFiles?: File[];
}

export interface UpdateProjectMultipartRequest extends ProjectMultipartRequest {
  id: string;
  newImageFiles?: File[];
}

export interface ProjectQueryParams extends BaseQueryParams {
  search?: string;
  status?: string;
}

export type { Project as default };
