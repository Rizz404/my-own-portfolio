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

// * String enum, BUKAN numeric - backend nge-serialize/deserialize enum ini pakai
// nama konstannya (mis. `"archived"`, `"desktop"`, `"figma"`), bukan ordinal number.
// Kalau ini numeric enum, request body ngirim angka (0,1,2,...) yang gak nyambung
// ke backend, dan response yang isinya string gak ke-match pas dicocokin balik ke
// `<option value>` di form edit (status/checkbox/link jadi keliatan kosong).
export enum ProjectStatus {
  active = "active",
  inactive = "inactive",
  development = "development",
  maintenance = "maintenance",
  archived = "archived",
}

export enum ProjectType {
  frontend = "frontend",
  backend = "backend",
  fullstack = "fullstack",
  mobile = "mobile",
  desktop = "desktop",
  api = "api",
  library = "library",
  other = "other",
}

export enum LinkType {
  github = "github",
  gitlab = "gitlab",
  bitbucket = "bitbucket",
  source_code = "source_code",
  demo = "demo",
  website = "website",
  figma = "figma",
  documentation = "documentation",
  api_docs = "api_docs",
  video = "video",
  playstore = "playstore",
  appstore = "appstore",
  npm = "npm",
  dockerhub = "dockerhub",
  staging = "staging",
  other = "other",
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
