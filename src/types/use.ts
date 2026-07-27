import type { BaseQueryParams } from "./api";

export interface Use {
  id: string; // * Tipe snowflake string di backend
  itemName: string;
  category: Category;
  logoUrl: string | null;
  pictures: string[] | null;
  reasons: string | null;
  links: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export enum Category {
  software,
  hardware,
}

export interface UseRequest {
  itemName: string;
  category: string;
  logoUrl?: string | null;
  pictures?: string[] | null;
  reasons?: string | null;
  links?: string[] | null;
  deletedPictures?: string[] | null;
}

export interface UseQueryParams extends BaseQueryParams {
  search?: string;
  category?: string;
}

export interface UseMultipartRequest {
  useRequest: UseRequest;
  logoFile?: File;
  pictureFiles?: File[];
}

export interface UpdateUseMultipartRequest extends UseMultipartRequest {
  id: string;
  newPictureFiles?: File[];
}

export type { Use as default };
