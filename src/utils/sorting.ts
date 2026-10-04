import type { FilterResource } from "./advancedFilters";
import type { BaseQueryParams, SortDirection } from "@/types/api";

const commonSortFields = ["id", "createdAt", "updatedAt"] as const;
export const resourceSortFields = {
  projects: [...commonSortFields, "slug", "status", "name", "description"],
  blogs: [
    ...commonSortFields,
    "slug",
    "isPublished",
    "viewsCount",
    "likesCount",
    "dislikesCount",
    "title",
    "content",
  ],
  experiences: [
    ...commonSortFields,
    "companyName",
    "startDate",
    "endDate",
    "isCurrent",
    "position",
    "description",
  ],
  skills: [...commonSortFields, "name", "category", "logoUrl", "description"],
  uses: [...commonSortFields, "itemName", "category", "logoUrl", "reasons"],
  users: [
    ...commonSortFields,
    "nickname",
    "fullName",
    "email",
    "role",
    "provider",
    "gender",
    "dateOfBirth",
    "placeOfBirth",
    "address",
    "phoneNumber",
    "bio",
  ],
  "blog-attachments": [...commonSortFields, "fileName", "fileUrl", "fileType", "blogId"],
} as const satisfies Record<FilterResource, readonly string[]>;

export type SortField<R extends FilterResource> = (typeof resourceSortFields)[R][number];
export interface SortRule {
  field: string;
  direction: SortDirection;
}

export function getSortRule(params: BaseQueryParams): SortRule {
  return {
    field: params.sortBy?.[0] ?? (params.cursor ? "id" : "createdAt"),
    direction: params.sortDir?.[0] ?? "desc",
  };
}

export function applySortRule<T extends object>(params: T, rule: SortRule) {
  return {
    ...params,
    sortBy: [rule.field],
    sortDir: [rule.direction],
    page: 1,
    cursor: undefined,
  };
}
