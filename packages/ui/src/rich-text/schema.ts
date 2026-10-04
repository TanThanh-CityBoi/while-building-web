import { BlockNoteSchema, defaultBlockSpecs, type PartialBlock } from '@blocknote/core';

/**
 * The block types While Building documents may contain: text, lists, quotes,
 * code, dividers and images (by URL). The CMS editor and every read-only
 * renderer use this one schema, so what can be written can be displayed.
 */
export const richTextSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    quote: defaultBlockSpecs.quote,
    codeBlock: defaultBlockSpecs.codeBlock,
    divider: defaultBlockSpecs.divider,
    image: defaultBlockSpecs.image,
  },
});

export type RichTextSchema = typeof richTextSchema;
type RichTextBlock = PartialBlock<
  RichTextSchema['blockSchema'],
  RichTextSchema['inlineContentSchema'],
  RichTextSchema['styleSchema']
>;

/** A stored document: JSON blocks as the editor produced them. */
export type RichTextDocument = readonly unknown[];

const SUPPORTED_TYPES = new Set<string>(Object.keys(richTextSchema.blockSpecs));

/**
 * Prepares a stored document for BlockNote: blocks of unknown types become
 * paragraphs (keeping their text), malformed entries are dropped. Returns
 * `undefined` for an empty document, which BlockNote opens as one empty
 * paragraph.
 */
export function toEditorContent(document: RichTextDocument | null | undefined) {
  const blocks = normalize(document ?? []);
  return blocks.length > 0 ? blocks : undefined;
}

function normalize(blocks: readonly unknown[]): RichTextBlock[] {
  return blocks.flatMap((value): RichTextBlock[] => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
    const block = value as Record<string, unknown>;
    const children = Array.isArray(block.children) ? normalize(block.children) : undefined;
    if (typeof block.type === 'string' && SUPPORTED_TYPES.has(block.type)) {
      return [{ ...block, children } as RichTextBlock];
    }
    return [
      {
        type: 'paragraph',
        content: Array.isArray(block.content) ? block.content : undefined,
        children,
      } as RichTextBlock,
    ];
  });
}
