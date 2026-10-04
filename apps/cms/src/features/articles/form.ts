import type {
  ArticleContent,
  CreateArticleInput,
  ManagedArticle,
  UpdateArticleInput,
} from '@while-building/types';
import { isValidSlug } from '@while-building/utils';

// The article form's values and checks. The API is authoritative; these only catch obvious
// mistakes early and give field-level messages.

export const TITLE_MAX_LENGTH = 200;
export const EXCERPT_MAX_LENGTH = 500;
export const CATEGORY_MAX_LENGTH = 50;

export interface ArticleFormValues {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string;
}

export type ArticleFormErrors = Partial<Record<keyof ArticleFormValues, string>>;

export const emptyFormValues: ArticleFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  coverImage: '',
};

export function toFormValues(article: ManagedArticle): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? '',
    category: article.category ?? '',
    coverImage: article.coverImage ?? '',
  };
}

export function validateArticle(values: ArticleFormValues): ArticleFormErrors {
  const errors: ArticleFormErrors = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Give the article a title.';
  else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the title under ${TITLE_MAX_LENGTH} characters.`;
  }
  if (values.slug && !isValidSlug(values.slug)) {
    errors.slug = 'Use lower-case letters, digits and single hyphens, e.g. my-first-k3s-cluster.';
  }
  if (values.excerpt.trim().length > EXCERPT_MAX_LENGTH) {
    errors.excerpt = `Keep the excerpt under ${EXCERPT_MAX_LENGTH} characters.`;
  }
  if (values.category.trim().length > CATEGORY_MAX_LENGTH) {
    errors.category = `Keep the category under ${CATEGORY_MAX_LENGTH} characters.`;
  }
  const cover = values.coverImage.trim();
  if (cover && !/^https?:\/\/\S+$/i.test(cover)) {
    errors.coverImage = 'Use a full image URL starting with https://.';
  }
  return errors;
}

const orNull = (value: string) => value.trim() || null;

export function toCreateInput(
  values: ArticleFormValues,
  content: ArticleContent,
): CreateArticleInput {
  return {
    title: values.title.trim(),
    // Empty: the API derives it from the title.
    slug: values.slug || undefined,
    excerpt: orNull(values.excerpt),
    category: orNull(values.category),
    coverImage: orNull(values.coverImage),
    content,
  };
}

/** Only what changed since `saved` (and the content when it was edited). */
export function toUpdateInput(
  values: ArticleFormValues,
  saved: ArticleFormValues,
  content: ArticleContent | null,
): UpdateArticleInput {
  const input: UpdateArticleInput = {};
  if (values.title.trim() !== saved.title) input.title = values.title.trim();
  if (values.slug !== saved.slug) input.slug = values.slug;
  if (values.excerpt.trim() !== saved.excerpt) input.excerpt = orNull(values.excerpt);
  if (values.category.trim() !== saved.category) input.category = orNull(values.category);
  if (values.coverImage.trim() !== saved.coverImage) input.coverImage = orNull(values.coverImage);
  if (content) input.content = content;
  return input;
}

export function isSameForm(a: ArticleFormValues, b: ArticleFormValues): boolean {
  return (Object.keys(a) as Array<keyof ArticleFormValues>).every(
    (key) => a[key].trim() === b[key].trim(),
  );
}

/** Whether a document has any text: the API won't publish an empty article. */
export function hasText(content: ArticleContent): boolean {
  const visit = (node: unknown): boolean => {
    if (Array.isArray(node)) return node.some(visit);
    if (typeof node !== 'object' || node === null) return false;
    const record = node as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text.trim().length > 0;
    return Object.entries(record).some(
      ([key, value]) => key !== 'props' && key !== 'styles' && visit(value),
    );
  };
  return visit(content);
}
