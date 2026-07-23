export interface Use {
  id: string; // * Tipe snowflake string di backend
  itemName: string;
  category: Category;
  logoUrl: string;
  pictures: string[];
  reasons: string;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

export enum Category {
  software,
  hardware,
}

export type { Use as default };
