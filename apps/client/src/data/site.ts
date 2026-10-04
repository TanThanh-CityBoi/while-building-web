import type { LinkItem } from '@while-building/types';
import { SITE_NAME, SITE_TAGLINE, trimTrailingSlash } from '@while-building/utils';

export const site = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  description:
    'A personal technical space for the things I build, the things I learn, the experiments I run, the failures I debug — and the engineering notes I keep along the way.',
  /** Public origin, e.g. `https://whilebuilding.dev` (`VITE_SITE_URL`); canonical URLs need it. */
  url: import.meta.env.VITE_SITE_URL ? trimTrailingSlash(import.meta.env.VITE_SITE_URL) : null,
} as const;

// TODO: fill in real URLs. Links without `href` render as "coming soon" placeholders.
export const socialLinks: LinkItem[] = [
  { label: 'GitHub', href: undefined }, // e.g. https://github.com/<username>
  { label: 'LinkedIn', href: undefined }, // e.g. https://www.linkedin.com/in/<profile>
  { label: 'Email', href: undefined }, // e.g. mailto:<you>@<domain>
];
