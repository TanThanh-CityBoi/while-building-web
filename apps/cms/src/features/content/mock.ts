import type { Project } from '@while-building/types';

// Sample CMS content (including drafts and archived items) until while-building-api has content
// endpoints. Only `source.ts` reads this file.

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    slug: 'personal-homelab',
    name: 'Personal Homelab',
    description: 'A small Kubernetes-based homelab running on a Mini PC.',
    technologies: ['k3s', 'Docker', 'Argo CD', 'Cloudflare'],
    stage: 'active',
    featured: true,
    status: 'PUBLISHED',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'project-2',
    slug: 'mcp-analytics-playground',
    name: 'MCP Analytics Playground',
    description: 'An experiment around using MCP to analyze website data.',
    technologies: ['TypeScript', 'NestJS', 'MCP'],
    stage: 'experimental',
    featured: true,
    status: 'PUBLISHED',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'project-3',
    slug: 'developer-playground',
    name: 'Developer Playground',
    description: 'Small experiments, prototypes and things I build while learning.',
    technologies: ['React', 'Node.js', 'Docker'],
    stage: 'active',
    featured: true,
    status: 'PUBLISHED',
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'project-4',
    slug: 'while-building-cms',
    name: 'While Building CMS',
    description: 'The internal tool used to manage this site.',
    technologies: ['React', 'TanStack Query', 'Turborepo'],
    stage: 'experimental',
    featured: false,
    status: 'DRAFT',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-26T18:00:00Z',
  },
];
