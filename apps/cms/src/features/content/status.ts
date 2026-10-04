import type { ArticleStatus, ContentStatus } from '@while-building/types';
import type { Tone } from '@/components/ToneBadge';

export const contentStatusLabel: Record<ContentStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const contentStatusTone: Record<ContentStatus, Tone> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
};

export interface StatusOption<S extends string> {
  value: S | '';
  label: string;
}

export const projectStatusOptions: StatusOption<ContentStatus>[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const articleStatusOptions: StatusOption<ArticleStatus>[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];
