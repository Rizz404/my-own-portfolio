export interface Project {
  id: string; // * Tipe snowflake string di backend
  slug: string;
  name: string;
  description: string;
  status: string;
  logoUrl: string | null;
  imageUrls: string[] | null;
  projectLinks: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export type { Project as default };
