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

// * String enum, BUKAN numeric - backend nge-serialize/deserialize enum ini pakai
// nama konstannya (mis. `"framework"`, `"database"`), bukan ordinal number.
export enum SkillCategory {
  programming_language = "programming_language",
  framework = "framework",
  database = "database",
  tool = "tool",
  other = "other",
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
