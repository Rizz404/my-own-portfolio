export interface Experience {
  id: string; // * Tipe snowflake string di backend
  companyName: string;
  position: string;
  description: string;
  jobdesks: string[];
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum Category {
  software,
  hardware,
}

export type { Experience as default };
