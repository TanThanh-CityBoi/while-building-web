import '@while-building/ui/rich-text.css';
import type { ArticleContent } from '@while-building/types';
import { RichTextViewer } from '@while-building/ui/rich-text';
import styles from './ArticleBody.module.css';

/**
 * An article's content, rendered read-only by BlockNote (exactly as written in
 * the CMS). Loaded on demand: only article pages pay for the editor engine.
 */
export default function ArticleBody({ content }: { content: ArticleContent }) {
  return <RichTextViewer document={content} className={styles.body} />;
}
