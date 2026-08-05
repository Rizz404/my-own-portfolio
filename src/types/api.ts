export interface PagingInfo {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface SuccessResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  status: string;
  message: string;
  data: T;
  pagination: PagingInfo;
}

export interface CursorInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
  perPage: number;
}

export interface ErrorResponse<T = unknown> {
  status: string;
  message: string;
  error?: T;
}

export interface BaseQueryParams {
  cursor?: string;
  page?: number;
  size?: number;
  sortBy?: string[];
  sortDir?: string[];
}

// * Locale yang didukung untuk translation di Blog, Experience, Project, Skill, Use, dan User
export enum LanguageCode {
  en,
  id,
  ja,
}
