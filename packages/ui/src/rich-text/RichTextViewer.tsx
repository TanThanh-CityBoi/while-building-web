import { BlockNoteViewRaw, useCreateBlockNote } from '@blocknote/react';
import { cn } from '../lib/utils';
import { richTextSchema, toEditorContent, type RichTextDocument } from './schema';

export interface RichTextViewerProps {
  document: RichTextDocument;
  className?: string;
}

/**
 * Renders a document read-only with BlockNote itself (no toolbars, menus or
 * UI library), so it looks exactly as it was written. Styles:
 * '@while-building/ui/rich-text.css'.
 */
export function RichTextViewer({ document, className }: RichTextViewerProps) {
  const editor = useCreateBlockNote(
    { schema: richTextSchema, initialContent: toEditorContent(document) },
    [document],
  );
  return (
    <BlockNoteViewRaw
      editor={editor}
      editable={false}
      formattingToolbar={false}
      linkToolbar={false}
      slashMenu={false}
      sideMenu={false}
      filePanel={false}
      tableHandles={false}
      emojiPicker={false}
      comments={false}
      className={cn('wb-rich-text wb-rich-text--viewer', className)}
    />
  );
}
