import type { BaseQueryParams, LanguageCode } from "./api";

export interface Use {
  id: string; // * Tipe snowflake string di backend
  itemName: string;
  reasons: string | null;
  resolvedLocale: string;
  category: Category;
  logoUrl: string | null;
  pictures: string[] | null;
  links: string[] | null;
  createdAt: string;
  updatedAt: string;
}

// * String enum, BUKAN numeric - backend nge-serialize/deserialize enum ini pakai
// nama konstannya (mis. `"software"`, `"hardware"`), bukan ordinal number.
export enum Category {
  software = "software",
  hardware = "hardware",
}

export interface UseTranslationRequest {
  locale: LanguageCode;
  reasons?: string | null;
}

export interface UseRequest {
  itemName: string;
  category: string;
  logoUrl?: string | null;
  pictures?: string[] | null;
  links?: string[] | null;
  deletedPictures?: string[] | null;
  translations: UseTranslationRequest[];
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
