import { ProjectStatus, ProjectType, LinkType } from "@/types/project";
import { SkillCategory } from "@/types/skill";
import { Category } from "@/types/use";
import { Role, AuthProvider, Gender } from "@/types/user";
import { FileType } from "@/types/blogAttachment";

export type FilterResource =
  | "projects"
  | "skills"
  | "uses"
  | "blogs"
  | "experiences"
  | "users"
  | "blog-attachments";
export interface FilterField {
  key: string;
  type?: "text" | "date" | "datetime-local" | "number" | "boolean" | "multi";
  values?: string[];
}
const commonFields: FilterField[] = [
  { key: "ids" },
  { key: "createdFrom", type: "datetime-local" },
  { key: "createdTo", type: "datetime-local" },
  { key: "updatedFrom", type: "datetime-local" },
  { key: "updatedTo", type: "datetime-local" },
];
const multi = (key: string, values: Record<string, string | number>): FilterField => ({
  key,
  type: "multi",
  values: Object.keys(values).filter((value) => Number.isNaN(Number(value))),
});
export const resourceFilterFields: Record<FilterResource, FilterField[]> = {
  projects: [
    multi("status", ProjectStatus),
    { key: "slug" },
    multi("projectTypes", ProjectType),
    multi("linkTypes", LinkType),
    { key: "techStack" },
  ],
  skills: [multi("category", SkillCategory)],
  uses: [{ key: "search" }, multi("category", Category)],
  blogs: [
    { key: "slug" },
    { key: "isPublished", type: "boolean" },
    { key: "minViews", type: "number" },
    { key: "maxViews", type: "number" },
  ],
  experiences: [
    { key: "isCurrent", type: "boolean" },
    { key: "companyName" },
    { key: "position" },
    { key: "startDate", type: "date" },
    { key: "endDate", type: "date" },
  ],
  users: [
    multi("role", Role),
    multi("provider", AuthProvider),
    multi("gender", Gender),
    { key: "email" },
    { key: "nickname" },
    { key: "dateOfBirthFrom", type: "date" },
    { key: "dateOfBirthTo", type: "date" },
  ],
  "blog-attachments": [{ key: "search" }, { key: "blogId" }, multi("fileType", FileType)],
};
export function getFilterFields(resource: FilterResource, exclude: string[] = []) {
  return [...resourceFilterFields[resource], ...commonFields].filter(
    (field) => !exclude.includes(field.key),
  );
}
// Explicit optional keys let useQuerySync restore filters from a shared URL.
export function advancedFilterDefaults(resource: FilterResource): Record<string, undefined> {
  return Object.fromEntries(getFilterFields(resource).map(({ key }) => [key, undefined]));
}
