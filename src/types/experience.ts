import type { BaseQueryParams } from "./api";

export interface Experience {
  id: string; // * Tipe snowflake string di backend
  companyName: string;
  position: string;
  description: string | null;
  jobdesks: string[] | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export enum Category {
  software,
  hardware,
}

export interface ExperienceRequest {
  companyName: string;
  position: string;
  description?: string | null;
  jobdesks?: string[] | null;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean | null;
}

export interface ExperienceQueryParams extends BaseQueryParams {
  search?: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
}

export type { Experience as default };
