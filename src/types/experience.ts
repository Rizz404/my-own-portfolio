import type { BaseQueryParams, LanguageCode } from "./api";

export interface Experience {
  id: string; // * Tipe snowflake string di backend
  companyName: string;
  position: string;
  description: string | null;
  jobdesks: string[] | null;
  resolvedLocale: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceTranslationRequest {
  locale: LanguageCode;
  position: string;
  description?: string | null;
  jobdesks?: string[] | null;
}

export interface ExperienceRequest {
  companyName: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean | null;
  translations: ExperienceTranslationRequest[];
}

export interface ExperienceQueryParams extends BaseQueryParams {
  search?: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
}

export type { Experience as default };
