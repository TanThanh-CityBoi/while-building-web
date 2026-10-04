import type { ArticleContent } from '@while-building/types';
import type { ArticleEditorProps } from '@/features/articles/components/ArticleEditor';

import { paragraph } from './blocks';

/** A textarea in place of BlockNote: each line becomes a paragraph. */
export function FakeEditor({ initialContent, onChange, editable = true }: ArticleEditorProps) {
  const text = initialContent
    .map((block) =>
      Array.isArray(block.content)
        ? block.content.map((run: { text?: string }) => run.text ?? '').join('')
        : '',
    )
    .join('\n');
  return (
    <textarea
      aria-label="Article content"
      defaultValue={text}
      readOnly={!editable}
      onChange={(e) =>
        onChange(e.target.value.split('\n').map((line) => paragraph(line)) as ArticleContent)
      }
    />
  );
}
