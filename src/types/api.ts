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

export type SortDirection = "asc" | "desc";

export interface BaseQueryParams<SortField extends string = string> {
  ids?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  cursor?: string;
  page?: number;
  size?: number;
  sortBy?: [SortField];
  sortDir?: [SortDirection];
}

// * String enum, BUKAN numeric - backend nge-serialize/deserialize enum ini pakai
// nama konstannya (mis. `"en"`, `"id"`), bukan ordinal number.
// Locale yang didukung untuk translation di Blog, Experience, Project, Skill, Use, dan User
export enum LanguageCode {
  en = "en",
  id = "id",
}
