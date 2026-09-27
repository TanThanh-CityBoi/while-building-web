import { useEffect } from 'react';

const APP_TITLE = 'While Building CMS';

/** `Users · While Building CMS` */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE;
  }, [title]);
}
