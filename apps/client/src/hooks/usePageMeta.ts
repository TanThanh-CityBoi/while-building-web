import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { site } from '@/data/site';

interface PageMeta {
  /** Page name, e.g. `Articles`. Omit on the home page to use the site name alone. */
  title?: string;
  description?: string;
  /** Absolute image URL for link previews (Open Graph / Twitter). */
  image?: string | null;
  /** `article` for an article page. */
  type?: 'website' | 'article';
}

/** Sets (creating if needed) or removes a `<meta>` tag in the document head. */
function setMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (content === null) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.append(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(href: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (href === null) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.append(link);
  }
  link.href = href;
}

/**
 * Updates the title, description, canonical URL and link-preview tags for the current page.
 * The canonical URL and `og:url` need `VITE_SITE_URL`. Crawlers that don't run JavaScript see
 * the defaults in `index.html` (the site is a static SPA).
 */
export function usePageMeta({
  title,
  description = site.description,
  image = null,
  type = 'website',
}: PageMeta = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — ${site.name}` : site.name;
    const url = site.url ? `${site.url}${pathname}` : null;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setCanonical(url);
  }, [title, description, image, type, pathname]);
}
