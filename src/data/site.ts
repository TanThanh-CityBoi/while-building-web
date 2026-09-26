import type { LinkItem } from '@/types/content';

export const site = {
  name: 'While Building',
  tagline: 'Things I build, things I learn, things I break.',
  description:
    'A personal space where I document things I build, experiments I run, problems I solve, and lessons I learn along the way.',
} as const;

// TODO: fill in real URLs. Links without `href` render as "coming soon" placeholders.
export const socialLinks: LinkItem[] = [
  { label: 'GitHub', href: undefined }, // e.g. https://github.com/<username>
  { label: 'LinkedIn', href: undefined }, // e.g. https://www.linkedin.com/in/<profile>
  { label: 'Email', href: undefined }, // e.g. mailto:<you>@<domain>
];
