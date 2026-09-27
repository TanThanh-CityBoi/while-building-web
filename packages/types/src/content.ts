/** Publishing state shared by all CMS content. */
export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** A link that may not exist yet; without `href` apps render it as a placeholder. */
export interface LinkItem {
  label: string;
  href?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  status: ContentStatus;
  /** ISO date; `null` until published. */
  publishedAt: string | null;
  readingTimeMinutes: number;
  /** Article body (format TBD — likely Markdown/MDX). Absent until the CMS exists. */
  body?: string;
  createdAt: string;
  updatedAt: string;
}

/** Where a project is in its own lifecycle (separate from its publishing `status`). */
export type ProjectStage = 'active' | 'experimental' | 'archived';

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  technologies: string[];
  stage?: ProjectStage;
  featured: boolean;
  status: ContentStatus;
  links?: LinkItem[];
  createdAt: string;
  updatedAt: string;
}
