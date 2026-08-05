import type { BaseQueryParams, LanguageCode } from "./api";

export interface Skill {
  id: string; // * Tipe snowflake string di backend
  name: string;
  category: SkillCategory;
  logoUrl: string | null;
  description: string | null;
  resolvedLocale: string;
  createdAt: string;
  updatedAt: string;
}

export enum SkillCategory {
  programming_language,
  framework,
  database,
  tool,
  other,
}

export interface SkillTranslationRequest {
  locale: LanguageCode;
  description?: string | null;
}

export interface SkillRequest {
  name: string;
  category: string;
  logoUrl?: string | null;
  translations: SkillTranslationRequest[];
}

export interface SkillMultipartRequest {
  skillRequest: SkillRequest;
  logoFile?: File;
}

export interface UpdateSkillMultipartRequest extends SkillMultipartRequest {
  id: string;
}

export interface SkillQueryParams extends BaseQueryParams {
  search?: string;
  category?: string;
}

export type { Skill as default };
