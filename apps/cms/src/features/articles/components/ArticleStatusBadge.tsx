import type { ArticleStatus } from '@while-building/types';
import { ToneBadge } from '@/components/ToneBadge';

const label: Record<ArticleStatus, string> = { DRAFT: 'Draft', PUBLISHED: 'Published' };

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <ToneBadge dot tone={status === 'PUBLISHED' ? 'success' : 'warning'}>
      {label[status]}
    </ToneBadge>
  );
}
