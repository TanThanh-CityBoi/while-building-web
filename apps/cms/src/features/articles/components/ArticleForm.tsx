import type { ArticleContent } from '@while-building/types';
import { Input } from '@while-building/ui/components/input';
import { Textarea } from '@while-building/ui/components/textarea';
import { Suspense, useId, type ReactNode } from 'react';
import { FormField } from '@/components/FormField';
import { LoadingState } from '@/components/States';
import { useArticlesDependencies } from '../context';
import {
  CATEGORY_MAX_LENGTH,
  EXCERPT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  type ArticleFormErrors,
  type ArticleFormValues,
} from '../form';

interface ArticleFormProps {
  values: ArticleFormValues;
  errors: ArticleFormErrors;
  onChange: (patch: Partial<ArticleFormValues>) => void;
  /** Where the editor starts; remount (with `key`) to load another document. */
  initialContent: ArticleContent;
  onContentChange: (content: ArticleContent) => void;
  readOnly?: boolean;
  /** Shown under the slug, e.g. a warning that the public URL will change. */
  slugHint?: string;
  /** Facts about a saved article (author, dates), above the fields. */
  details?: ReactNode;
}

/**
 * The writing workspace: title and body on the left, the article's details on
 * the right (stacked on small screens).
 */
export function ArticleForm({
  values,
  errors,
  onChange,
  initialContent,
  onContentChange,
  readOnly = false,
  slugHint,
  details,
}: ArticleFormProps) {
  const { Editor } = useArticlesDependencies();
  const contentLabelId = useId();
  const titleErrorId = useId();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <label htmlFor="article-title" className="sr-only">
            Title
          </label>
          <Textarea
            id="article-title"
            name="title"
            rows={1}
            placeholder="Untitled"
            maxLength={TITLE_MAX_LENGTH}
            value={values.title}
            readOnly={readOnly}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? titleErrorId : undefined}
            onChange={(e) => onChange({ title: e.target.value.replace(/\n/g, ' ') })}
            className="field-sizing-content min-h-0 resize-none border-0 bg-transparent px-0 py-1 text-3xl leading-tight font-semibold tracking-tight shadow-none focus-visible:ring-0 md:text-4xl dark:bg-transparent"
          />
          {errors.title && (
            <p id={titleErrorId} className="text-sm text-destructive">
              {errors.title}
            </p>
          )}
        </div>

        <section aria-labelledby={contentLabelId} className="flex min-w-0 flex-col gap-2">
          <h2
            id={contentLabelId}
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
          >
            Content
          </h2>
          <div className="sm:-ml-12">
            <Suspense fallback={<LoadingState label="Loading the editor…" />}>
              <Editor
                initialContent={initialContent}
                onChange={onContentChange}
                editable={!readOnly}
                labelledBy={contentLabelId}
              />
            </Suspense>
          </div>
        </section>
      </div>

      <aside
        aria-label="Article details"
        className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start"
      >
        {details}
        <FormField
          label="Slug"
          error={errors.slug}
          hint={slugHint ?? 'Leave empty to derive it from the title.'}
        >
          {(field) => (
            <div className="flex items-center rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="pl-2.5 font-mono text-xs text-muted-foreground select-none">
                /articles/
              </span>
              <input
                {...field}
                name="slug"
                value={values.slug}
                readOnly={readOnly}
                spellCheck={false}
                autoCapitalize="off"
                onChange={(e) => onChange({ slug: e.target.value })}
                className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 font-mono text-sm outline-none"
              />
            </div>
          )}
        </FormField>

        <FormField
          label="Excerpt"
          error={errors.excerpt}
          hint={`${values.excerpt.trim().length}/${EXCERPT_MAX_LENGTH} · shown in lists and link previews`}
        >
          {(field) => (
            <Textarea
              {...field}
              name="excerpt"
              rows={4}
              value={values.excerpt}
              readOnly={readOnly}
              placeholder="What is this article about?"
              onChange={(e) => onChange({ excerpt: e.target.value })}
            />
          )}
        </FormField>

        <FormField label="Category" error={errors.category} hint="Optional, e.g. DevOps.">
          {(field) => (
            <Input
              {...field}
              name="category"
              maxLength={CATEGORY_MAX_LENGTH}
              value={values.category}
              readOnly={readOnly}
              onChange={(e) => onChange({ category: e.target.value })}
            />
          )}
        </FormField>

        <FormField
          label="Cover image URL"
          error={errors.coverImage}
          hint="Optional. Also used for link previews."
        >
          {(field) => (
            <Input
              {...field}
              name="coverImage"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={values.coverImage}
              readOnly={readOnly}
              onChange={(e) => onChange({ coverImage: e.target.value })}
            />
          )}
        </FormField>
        {values.coverImage.trim() && !errors.coverImage && (
          <img
            src={values.coverImage.trim()}
            alt=""
            className="aspect-video w-full rounded-lg border object-cover"
          />
        )}
      </aside>
    </div>
  );
}
