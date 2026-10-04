import '@blocknote/shadcn/style.css';
import '@while-building/ui/rich-text.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import type { ArticleContent } from '@while-building/types';
import { richTextSchema, toEditorContent } from '@while-building/ui/rich-text';

export interface ArticleEditorProps {
  /** The document to start from; later changes to it are ignored (remount with a `key`). */
  initialContent: ArticleContent;
  /** Called with the whole document after every edit. */
  onChange: (content: ArticleContent) => void;
  editable?: boolean;
  /** Id of the element that labels the editor. */
  labelledBy?: string;
}

/**
 * The article body editor: BlockNote with the shared While Building schema, so
 * what is written here renders the same on the public site. Type `/` for blocks.
 */
export default function ArticleEditor({
  initialContent,
  onChange,
  editable = true,
  labelledBy,
}: ArticleEditorProps) {
  const editor = useCreateBlockNote({
    schema: richTextSchema,
    initialContent: toEditorContent(initialContent),
  });

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      // BlockNote blocks are JSON objects; the API stores them as they are.
      onChange={() => onChange(editor.document as unknown as ArticleContent)}
      aria-labelledby={labelledBy}
      className="wb-rich-text wb-rich-text--editor min-h-80"
    />
  );
}
