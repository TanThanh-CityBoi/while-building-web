/** A link that may not exist yet. Without `href` it renders as a visible placeholder. */
export interface LinkItem {
  label: string;
  href?: string;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** ISO date, e.g. `2026-09-12`. */
  publishedAt: string;
  readingTimeMinutes: number;
}

export type ProjectStatus = 'active' | 'experimental' | 'archived';

export interface Project {
  slug: string;
  name: string;
  description: string;
  technologies: string[];
  status?: ProjectStatus;
  featured?: boolean;
  links?: LinkItem[];
}

export type ExperimentStatus = 'running' | 'paused' | 'planned';

export interface Experiment {
  title: string;
  description: string;
  status: ExperimentStatus;
}
