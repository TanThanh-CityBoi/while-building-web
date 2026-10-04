/** Publishing state of projects. */
export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** An article is a draft until published; unpublishing makes it a draft again. */
export const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

/** A link that may not exist yet; without `href` apps render it as a placeholder. */
export interface LinkItem {
  label: string;
  href?: string;
}

/**
 * One block of an article's content, as the CMS editor (BlockNote) writes it:
 * a paragraph, heading, list item, image… Stored and served as-is.
 */
export interface ContentBlock {
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: ContentBlock[];
  [field: string]: unknown;
}

/** An article's body: a block document (JSON). */
export type ArticleContent = ContentBlock[];

export interface ArticleAuthor {
  id: string;
  name: string;
}

/** A published article in a list (`GET /articles`). Never carries the status. */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  /** Short summary for lists and link previews. */
  excerpt: string | null;
  category: string | null;
  /** Absolute http(s) URL. */
  coverImage: string | null;
  /** `null` when the author's account no longer exists. */
  author: ArticleAuthor | null;
  /** ISO date-time; `null` while a draft. */
  publishedAt: string | null;
  /** Estimated by the API from the content. */
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

/** A published article with its content (`GET /articles/:slug`). */
export interface Article extends ArticleSummary {
  content: ArticleContent;
}

/** `GET /articles` query. */
export interface ListArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

// --- Article management (CMS, `/content/articles`) -------------------------

/** An article in the CMS list, in any status (no content). */
export interface ManagedArticleSummary extends ArticleSummary {
  status: ArticleStatus;
}

/** An article in the CMS, with its content. */
export interface ManagedArticle extends ManagedArticleSummary {
  content: ArticleContent;
}

export type ArticleSortField = 'updatedAt' | 'createdAt' | 'publishedAt' | 'title';

/** `GET /content/articles` query. Default: most recently updated first. */
export interface ListManagedArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ArticleStatus;
  sort?: ArticleSortField;
  order?: 'asc' | 'desc';
}

/** `POST /content/articles`. The slug defaults to one derived from the title. */
export interface CreateArticleInput {
  title: string;
  slug?: string;
  /** Empty or `null` means none. */
  excerpt?: string | null;
  category?: string | null;
  coverImage?: string | null;
  content?: ArticleContent;
}

/** `PATCH /content/articles/:id`: only the fields present change; the title never changes the slug. */
export type UpdateArticleInput = Partial<CreateArticleInput>;

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
