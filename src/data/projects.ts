import type { Project } from '@/types/content';

// Mock data. Links without `href` are placeholders shown as "soon".
export const projects: Project[] = [
  {
    slug: 'personal-homelab',
    name: 'Personal Homelab',
    description: 'A small Kubernetes-based homelab running on a Mini PC.',
    technologies: ['k3s', 'Docker', 'Argo CD', 'Cloudflare'],
    status: 'active',
    featured: true,
    links: [{ label: 'GitHub' }],
  },
  {
    slug: 'mcp-analytics-playground',
    name: 'MCP Analytics Playground',
    description: 'An experiment around using MCP to analyze website data.',
    technologies: ['TypeScript', 'NestJS', 'MCP'],
    status: 'experimental',
    featured: true,
    links: [{ label: 'GitHub' }, { label: 'Demo' }],
  },
  {
    slug: 'developer-playground',
    name: 'Developer Playground',
    description: 'Small experiments, prototypes and things I build while learning.',
    technologies: ['React', 'Node.js', 'Docker'],
    status: 'active',
    featured: true,
    links: [{ label: 'GitHub' }],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
