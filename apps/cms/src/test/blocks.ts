/** A paragraph block with one plain text run, as BlockNote writes it. */
export const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text, styles: {} }],
});
