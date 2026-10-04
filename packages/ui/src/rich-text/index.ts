// Rich text (BlockNote documents). Kept out of the root export so apps that
// don't render documents never bundle the editor engine.
export { RichTextViewer, type RichTextViewerProps } from './RichTextViewer';
export {
  richTextSchema,
  toEditorContent,
  type RichTextDocument,
  type RichTextSchema,
} from './schema';
