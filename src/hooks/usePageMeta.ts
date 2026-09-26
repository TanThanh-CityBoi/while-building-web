import { useEffect } from 'react';
import { site } from '@/data/site';

interface PageMeta {
  /** Page name, e.g. `Articles`. Omit on the home page to use the site name alone. */
  title?: string;
  description?: string;
}

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

/** Updates the document title and description tags defined in `index.html`. */
export function usePageMeta({ title, description = site.description }: PageMeta = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${site.name}` : site.name;

    document.title = fullTitle;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', fullTitle);
    setMetaContent('meta[property="og:description"]', description);
  }, [title, description]);
}
