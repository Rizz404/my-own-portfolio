import type { SortField } from "@/utils/sorting";
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

export interface ExperienceQueryParams extends BaseQueryParams<SortField<"experiences">> {
  search?: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
  companyName?: string;
  position?: string;
}

export type { Experience as default };
