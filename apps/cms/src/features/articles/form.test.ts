import { describe, expect, it } from 'vitest';
import {
  emptyFormValues,
  hasText,
  toCreateInput,
  toUpdateInput,
  validateArticle,
  type ArticleFormValues,
} from './form';

const values = (patch: Partial<ArticleFormValues> = {}): ArticleFormValues => ({
  ...emptyFormValues,
  title: 'A Title',
  ...patch,
});

describe('validateArticle', () => {
  it('accepts a titled article', () => {
    expect(validateArticle(values({ slug: 'a-title', coverImage: 'https://x.dev/a.png' }))).toEqual(
      {},
    );
  });

  it('reports each invalid field', () => {
    expect(
      validateArticle(
        values({
          title: '  ',
          slug: 'Not A Slug',
          excerpt: 'x'.repeat(501),
          category: 'x'.repeat(51),
          coverImage: 'javascript:alert(1)',
        }),
      ),
    ).toEqual({
      title: expect.any(String),
      slug: expect.any(String),
      excerpt: expect.any(String),
      category: expect.any(String),
      coverImage: expect.any(String),
    });
  });
});

describe('inputs', () => {
  it('creates with trimmed fields, null for empty ones and no slug when blank', () => {
    expect(toCreateInput(values({ title: ' T ', excerpt: '  ' }), [])).toEqual({
      title: 'T',
      slug: undefined,
      excerpt: null,
      category: null,
      coverImage: null,
      content: [],
    });
  });

  it('updates only what changed', () => {
    const saved = values({ excerpt: 'Old', category: 'DevOps' });
    expect(toUpdateInput(values({ excerpt: 'Old', category: '' }), saved, null)).toEqual({
      category: null,
    });
    const content = [{ type: 'paragraph' }];
    expect(toUpdateInput(saved, saved, content)).toEqual({ content });
  });
});

describe('hasText', () => {
  it('finds text in nested blocks and links, ignoring empty ones', () => {
    expect(hasText([{ type: 'paragraph', content: [] }, { type: 'divider' }])).toBe(false);
    expect(
      hasText([
        {
          type: 'bulletListItem',
          content: [],
          children: [
            {
              type: 'paragraph',
              content: [
                { type: 'link', href: 'https://x.dev', content: [{ type: 'text', text: 'x' }] },
              ],
            },
          ],
        },
      ]),
    ).toBe(true);
  });
});
